export function sanitizeForPublic(html: string): string {
  let out = html || '';
  // Token replacements
  out = out.replace(/\{\{\s*firstName\s*\}\}/gi, 'Friend');
  out = out.replace(/\{\{\s*publicID\s*\}\}/gi, '');
  out = out.replace(/\{\{\s*public_id\s*\}\}/gi, '');
  out = out.replace(/\{\{\s*unsubscribeUrl\s*\}\}/gi, '');
  // Remove anchors that point to unsubscribe endpoints
  out = out.replace(/<a[^>]+href=["'][^"']*\/api\/newsletter\/unsubscribe[^"']*["'][^>]*>.*?<\/a>/gis, '');
  return out;
}

export function slugifyFromSubject(subject: string, maxLength = 80): string {
  const base = (subject || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '');
  return base || 'newsletter';
}

