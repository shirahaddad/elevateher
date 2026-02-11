import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/** True when S3 is configured; when false, we use data URLs for assets so parse works without AWS. */
function isStorageConfigured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ParseResponse = {
  html: string;
  text?: string;
  assets: Record<string, string>;
};

function guessContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.css')) return 'text/css';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'text/html; charset=utf-8';
  if (lower.endsWith('.txt')) return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
}

function mapToAsset(url: string, assetMap: Record<string, string>): string | null {
  // ignore external and cid refs
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('cid:')) return null;
  const normalized = url.replace(/^(\.\/|\/)/, ''); // remove leading ./ or /
  return (
    assetMap[normalized] ||
    assetMap['images/' + normalized] ||
    assetMap['./' + normalized] ||
    null
  );
}

function rewriteHtmlAssets(html: string, assetMap: Record<string, string>): string {
  let out = html;
  // img src="images/...”
  out = out.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (m, p1, src, p3) => {
    const mapped = mapToAsset(src, assetMap);
    return mapped ? `${p1}${mapped}${p3}` : m;
  });
  // img srcset="url 1x, url2 2x"
  out = out.replace(/(<img[^>]+srcset=["'])([^"']+)(["'][^>]*>)/gi, (m, p1, srcset, p3) => {
    const parts = srcset.split(',').map((part: string) => {
      const [u, descriptor] = part.trim().split(/\s+/, 2);
      const mapped = mapToAsset(u, assetMap);
      return [mapped || u, descriptor].filter(Boolean).join(' ');
    });
    return `${p1}${parts.join(', ')}${p3}`;
  });
  // <source srcset="..."> inside <picture>
  out = out.replace(/(<source[^>]+srcset=["'])([^"']+)(["'][^>]*>)/gi, (m, p1, srcset, p3) => {
    const parts = srcset.split(',').map((part: string) => {
      const [u, descriptor] = part.trim().split(/\s+/, 2);
      const mapped = mapToAsset(u, assetMap);
      return [mapped || u, descriptor].filter(Boolean).join(' ');
    });
    return `${p1}${parts.join(', ')}${p3}`;
  });
  // Generic src/href mapping for any tag when the URL maps to an uploaded asset
  out = out.replace(/(<[^>]+?\s(?:src|href)=["'])([^"']+)(["'][^>]*>)/gi, (m, p1, url, p3) => {
    const mapped = mapToAsset(url, assetMap);
    return mapped ? `${p1}${mapped}${p3}` : m;
  });
  // CSS url(images/...)
  out = out.replace(/url\((['"]?)([^'")]+)\1\)/gi, (m, quote, url) => {
    const mapped = mapToAsset(url, assetMap);
    return mapped ? `url(${mapped})` : m;
  });
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const zip = await JSZip.loadAsync(buf);

    // Identify main HTML and optional text
    let mainHtmlPath: string | null = null;
    let textPath: string | null = null;
    const assetUploads: Record<string, string> = {};

    // First pass: choose main files
    zip.forEach((relativePath, entry) => {
      const lower = relativePath.toLowerCase();
      if (!entry.dir && (lower.endsWith('.html') || lower.endsWith('.htm'))) {
        if (!mainHtmlPath || /index\.(html|htm)$/i.test(lower)) {
          mainHtmlPath = relativePath;
        }
      }
      if (!entry.dir && lower.endsWith('.txt')) {
        if (!textPath) textPath = relativePath;
      }
    });

    if (!mainHtmlPath) {
      return NextResponse.json({ error: 'No HTML file found in ZIP' }, { status: 400 });
    }

    // Second pass: upload images to S3 when configured, otherwise use data URLs (e.g. local dev without AWS)
    const useS3 = isStorageConfigured();
    const uploadPromises: Array<Promise<void>> = [];
    zip.forEach((relativePath, entry) => {
      if (entry.dir) return;
      const lower = relativePath.toLowerCase();
      if (lower.startsWith('images/') || lower.startsWith('img/') || lower.match(/\.(png|jpe?g|gif|webp|svg|css)$/i)) {
        uploadPromises.push(
          (async () => {
            const arrayBuffer = await entry.async('arraybuffer');
            const contentType = guessContentType(relativePath);
            const blobKey = `newsletter-assets/${Date.now()}-${relativePath.replace(/[^a-zA-Z0-9._/-]+/g, '_')}`;
            let url: string;
            if (useS3) {
              const { uploadPublicBlob } = await import('@/lib/storage');
              const result = await uploadPublicBlob(blobKey, arrayBuffer, contentType);
              url = result.url;
            } else {
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              url = `data:${contentType};base64,${base64}`;
            }
            // Store by several keys to maximize hit chance during rewrite
            assetUploads[relativePath] = url;
            assetUploads[relativePath.replace(/^\.?\//, '')] = url;
            assetUploads['images/' + relativePath.replace(/^\.?\//, '')] = url;
          })()
        );
      }
    });
    await Promise.all(uploadPromises);

    // Load main HTML and optional text
    const rawHtml = await zip.file(mainHtmlPath)!.async('string');
    const rawText = textPath ? await zip.file(textPath)!.async('string') : undefined;

    const rewrittenHtml = rewriteHtmlAssets(rawHtml, assetUploads);

    const payload: ParseResponse = {
      html: rewrittenHtml,
      text: rawText,
      assets: assetUploads,
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('POST /api/admin/newsletter/parse error:', error);
    return NextResponse.json({ error: 'Failed to parse ZIP' }, { status: 500 });
  }
}


