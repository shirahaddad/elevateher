'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="wmde-markdown-var" data-color-mode="light">
      <style jsx global>{`
        .wmde-markdown-var ul {
          list-style-type: disc;
          padding-left: 2em;
        }
        .wmde-markdown-var ul li {
          display: list-item;
        }
        .wmde-markdown-var ol {
          list-style-type: decimal;
          padding-left: 2em;
        }
        .wmde-markdown-var ol li {
          display: list-item;
        }
        .wmde-markdown-var p {
          white-space: pre-wrap;
        }
      `}</style>
      <MDPreview source={content} />
    </div>
  );
} 