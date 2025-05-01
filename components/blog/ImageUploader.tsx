/**
 * ImageUploader Component
 * 
 * A React component that handles image uploads with validation, compression, and preview functionality.
 * It provides a user-friendly interface for selecting images, automatically generates alt text,
 * and ensures images meet size and format requirements.
 * 
 * Features:
 * - Image preview
 * - File type validation (JPEG, PNG, GIF)
 * - Size validation (max 5MB)
 * - Automatic image compression and resizing
 * - Alt text generation and editing
 * - Error handling and user feedback
 * 
 * @component
 */

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

/**
 * Props for the ImageUploader component
 * 
 * @interface ImageUploaderProps
 * @property {File | null} selectedImage - The currently selected image file
 * @property {string} imageAlt - The alt text for the image (for accessibility)
 * @property {(file: File | null) => void} onImageChange - Callback function when the image changes
 * @property {(alt: string) => void} onImageAltChange - Callback function when the alt text changes
 * @property {string | Promise<string>} [currentImageUrl] - Optional URL of the current image (for edit mode)
 */
interface ImageUploaderProps {
  selectedImage: File | null;
  imageAlt: string;
  onImageChange: (file: File | null) => void;
  onImageAltChange: (alt: string) => void;
  currentImageUrl?: string | Promise<string>;
}

/**
 * ImageUploader Component
 * 
 * @param {ImageUploaderProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  imageAlt,
  onImageChange,
  onImageAltChange,
  currentImageUrl,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  /**
   * Effect to handle image preview creation and cleanup
   * Creates a preview URL when an image is selected and cleans it up on unmount
   */
  React.useEffect(() => {
    let isMounted = true;

    const loadImagePreview = async () => {
      if (selectedImage) {
        const previewUrl = URL.createObjectURL(selectedImage);
        if (isMounted) {
          setImagePreview(previewUrl);
        }
        return () => URL.revokeObjectURL(previewUrl);
      } else if (currentImageUrl) {
        setIsLoadingPreview(true);
        try {
          const url = await Promise.resolve(currentImageUrl);
          if (isMounted) {
            // Ensure the URL is properly formatted
            const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
            setImagePreview(cleanUrl);
          }
        } catch (err) {
          console.error('Error loading image URL:', err);
          if (isMounted) {
            setImagePreview(null);
            setError('Failed to load image preview');
          }
        } finally {
          if (isMounted) {
            setIsLoadingPreview(false);
          }
        }
      } else {
        if (isMounted) {
          setImagePreview(null);
        }
      }
    };

    loadImagePreview();

    return () => {
      isMounted = false;
    };
  }, [selectedImage, currentImageUrl]);

  /**
   * Validates the uploaded image file
   * 
   * @param {File} file - The file to validate
   * @returns {boolean} True if the file is valid, false otherwise
   */
  const validateImage = (file: File): boolean => {
    const validTypes = {
      'image/jpeg': true,
      'image/jpg': true,
      'image/png': true,
      'image/gif': true,
      'image/webp': true
    };

    if (!validTypes[file.type as keyof typeof validTypes]) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP).');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size should not exceed 5MB.');
      return false;
    }

    setError(null);
    return true;
  };

  /**
   * Resizes and compresses the uploaded image
   * 
   * @param {File} file - The file to resize
   * @returns {Promise<File>} The resized and compressed file
   */
  const resizeImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  /**
   * Handles file selection and processing
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the file input
   */
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

  /**
   * Handles changes to the alt text input
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the alt text input
   */
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
          {isLoadingPreview ? (
            <span className="text-xs">Loading...</span>
          ) : imagePreview ? (
            <img 
              src={imagePreview} 
              alt={imageAlt || 'Image preview'} 
              className="object-cover w-full h-full"
              onError={(e) => {
                console.error('Image failed to load:', imagePreview);
                // Clear the broken image and show the "No image" text
                setImagePreview(null);
                setError('Failed to load image');
              }}
              crossOrigin="anonymous"
            />
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
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploader; 