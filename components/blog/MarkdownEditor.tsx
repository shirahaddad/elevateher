'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value?: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="markdown-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="live"
        height={500}
        visibleDragbar={false}
        hideToolbar={false}
        enableScroll={true}
        textareaProps={{
          placeholder: 'Write your post content in markdown...',
        }}
      />
    </div>
  );
} 