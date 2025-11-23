
import React, { useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { AnalyzeIcon } from './icons/AnalyzeIcon';
import { ClearIcon } from './icons/ClearIcon';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  image: string | null;
  onDiagnose: () => void;
  isLoading: boolean;
  onReset: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, image, onDiagnose, isLoading, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />
      
      {!image && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-brand-gray-light hover:bg-gray-100 transition-colors cursor-pointer" onClick={triggerFileInput}>
            <div className="flex flex-col items-center space-y-4">
                <div className="flex -space-x-2">
                    <div className="bg-brand-green-light p-3 rounded-full ring-4 ring-white">
                        <CameraIcon className="w-8 h-8 text-brand-green-dark" />
                    </div>
                     <div className="bg-brand-green-light p-3 rounded-full ring-4 ring-white">
                        <UploadIcon className="w-8 h-8 text-brand-green-dark" />
                    </div>
                </div>
                <p className="text-lg font-semibold text-brand-gray-dark">Click to upload or take a photo</p>
                <p className="text-sm text-brand-gray">PNG, JPG, or WEBP. Make sure the leaf is well-lit and in focus.</p>
            </div>
        </div>
      )}

      {image && (
        <div className="space-y-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-inner border border-gray-200">
             <img src={image} alt="Plant leaf preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onDiagnose}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <AnalyzeIcon className="w-5 h-5 mr-2 -ml-1" />
              {isLoading ? 'Analyzing...' : 'Diagnose Plant'}
            </button>
            <button
              onClick={onReset}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-brand-gray-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <ClearIcon className="w-5 h-5 mr-2 -ml-1" />
              Choose Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
