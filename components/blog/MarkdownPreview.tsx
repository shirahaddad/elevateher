import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="max-w-none text-gray-800">
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p className="whitespace-pre-wrap leading-7 mb-4" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-8 mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-8 mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="list-item" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-purple-700 hover:text-purple-900 underline" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 