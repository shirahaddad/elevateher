'use client';

import { useRef, useState } from 'react';

type Props = {
  label?: string;
  accept?: string;
  valueUrl?: string | null;
  valueName?: string | null;
  previewImage?: boolean;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
};

export default function FileUpload({
  label,
  accept,
  valueUrl,
  valueName,
  previewImage = false,
  onSelect,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0] || null;
    onSelect(file);
  };

  return (
    <div>
      {label && <label className="block text-sm mb-1 text-gray-800">{label}</label>}
      <div
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          'border rounded-md p-3 cursor-pointer transition-colors',
          dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:bg-gray-50',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
        aria-disabled={disabled}
      >
        {previewImage && valueUrl ? (
          <img src={valueUrl} alt="Preview" className="w-full h-32 object-contain rounded border mb-2 bg-white" />
        ) : null}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {valueName ? <span className="font-medium">{valueName}</span> : <span>Drag & drop or click to upload</span>}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-100"
            disabled={disabled}
          >
            {valueName ? 'Change' : 'Upload'}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label={label || 'Upload file'}
      />
    </div>
  );
}

