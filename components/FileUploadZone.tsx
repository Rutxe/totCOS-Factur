import React, { useState, useCallback, useRef } from 'react';
import { UI_STRINGS } from '../constants';
import type { Language } from '../types';
import { UploadCloudIcon, FileIcon } from './icons';
import Spinner from './common/Spinner';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  lang: Language;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileUpload, isLoading, lang }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      onFileUpload(file);
      e.dataTransfer.clearData();
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const t = UI_STRINGS[lang];

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer 
        ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-800/50'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleZoneClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Spinner />
          <p className="text-lg font-semibold text-cyan-400">{t.uploadProcessing}</p>
          {uploadedFile && (
             <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FileIcon className="h-5 w-5" />
                <span>{uploadedFile.name}</span>
             </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloudIcon className="w-12 h-12 text-gray-400" />
          <h3 className="text-xl font-bold">{t.uploadTitle}</h3>
          <p className="text-gray-400">{t.uploadSubtitle}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
