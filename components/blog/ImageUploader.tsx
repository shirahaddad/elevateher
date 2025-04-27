import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  selectedImage: File | null;
  imageAlt: string;
  onImageChange: (file: File | null) => void;
  onImageAltChange: (alt: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  imageAlt,
  onImageChange,
  onImageAltChange,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedImage) {
      setImagePreview(URL.createObjectURL(selectedImage));
    } else {
      setImagePreview(null);
    }
    // Clean up preview URL on unmount
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF).');
      return false;
    }

    if (file.size > maxSize) {
      setError('Image size should not exceed 5MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const resizeImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && validateImage(file)) {
      try {
        const resizedFile = await resizeImage(file);
        onImageChange(resizedFile);
        // Auto-generate alt text from file name
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const formattedAlt = nameWithoutExt
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        onImageAltChange(formattedAlt);
      } catch (error) {
        setError('Failed to resize image. Please try again.');
        onImageChange(null);
        onImageAltChange('');
      }
    } else {
      onImageChange(null);
      onImageAltChange('');
    }
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageAltChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Main Image
      </label>
      <div className="flex items-center gap-4">
        <div className="w-32 h-20 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-400 overflow-hidden">
          {imagePreview ? (
            <img src={imagePreview} alt={imageAlt || 'Image preview'} className="object-cover w-full h-full" />
          ) : (
            <span className="text-xs">No image</span>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="main-image-upload" className="inline-block cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-semibold">
            Choose Image
          </label>
          <input
            id="main-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="text"
            placeholder="Image alt text (for accessibility)"
            value={imageAlt}
            onChange={handleAltChange}
            disabled={!selectedImage}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">Image upload coming soon</p>
    </div>
  );
};

export default ImageUploader; 