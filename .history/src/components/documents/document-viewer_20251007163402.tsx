'use client';

import { useState } from 'react';
import { Document } from '@prisma/client';

interface DocumentViewerProps {
  document: Document | null;
  label: string;
}

export function DocumentViewer({ document, label }: DocumentViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!document) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-1">No {label.toLowerCase()} uploaded</p>
          </div>
          <svg
            className="w-8 h-8 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/documents/download?id=${document.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    // Open in new tab for preview
    window.open(`/api/documents/download?id=${document.id}`, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.5,16H14V19H12.5V16H11V14.5H12.5V13.8C12.5,12.8 13.1,12 14.5,12C15,12 15.5,12.1 15.5,12.1V13.5H14.9C14.4,13.5 14,13.9 14,14.5V14.5H15.5V16M10.5,14.5V16H9V19H7.5V16H6V14.5H7.5V13.8C7.5,12.8 8.1,12 9.5,12C10,12 10.5,12.1 10.5,12.1V13.5H9.9C9.4,13.5 9,13.9 9,14.5V14.5H10.5Z" />
        </svg>
      );
    }
    
    if (ext === 'doc' || ext === 'docx') {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.5,20H13V19H15.5V20M15.5,18H13V14H15.5V18M12,20H10.5V14H12V20M9,20H7.5V14H9V20Z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getFileIcon(document.originalName)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
            <p className="text-sm text-gray-600 truncate" title={document.originalName}>
              {document.originalName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(document.size)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={handlePreview}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Preview document"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download document"
          >
            {isDownloading ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
