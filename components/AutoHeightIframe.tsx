'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  title: string;
  srcDoc: string;
  className?: string;
  minHeight?: number;
};

export default function AutoHeightIframe({ title, srcDoc, className, minHeight = 400 }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<number>(minHeight);

  const measure = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const body = doc.body;
      const html = doc.documentElement;
      const newHeight = Math.max(
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        html?.clientHeight || 0,
        html?.scrollHeight || 0,
        html?.offsetHeight || 0
      );
      if (newHeight && Math.abs(newHeight - height) > 2) {
        setHeight(newHeight);
      }
    } catch {
      // cross-origin or other failure, ignore
    }
  }, [height]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      measure();
      // Re-measure a few times as images/fonts load
      const timeouts = [100, 300, 800, 1500].map((t) => setTimeout(measure, t));
      // Try to observe mutations for dynamic content
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          const observer = new MutationObserver(() => measure());
          observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
          const cleanup = () => observer.disconnect();
          iframe.addEventListener('load', cleanup, { once: true });
        }
      } catch {
        // ignore
      }
      return () => {
        timeouts.forEach(clearTimeout);
      };
    };
    iframe.addEventListener('load', onLoad);
    return () => {
      iframe.removeEventListener('load', onLoad);
    };
  }, [measure, srcDoc]);

  // Also measure when srcDoc changes
  useEffect(() => {
    measure();
  }, [srcDoc, measure]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      className={className}
      style={{ height: Math.max(height, minHeight) }}
      srcDoc={srcDoc}
    />
  );
}

