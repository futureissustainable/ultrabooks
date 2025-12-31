'use client';

import { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { useBookStore } from '@/lib/stores/book-store';
import { Button, Modal } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface BookUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookUpload({ isOpen, onClose }: BookUploadProps) {
  const { uploadBook, isUploading } = useBookStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['.epub', '.pdf', '.mobi'];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      setError(`Invalid file type. Accepted formats: ${acceptedTypes.join(', ')}`);
      return false;
    }
    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      setError('File too large. Maximum size is 100MB.');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    const result = await uploadBook(uploadedFile);
    if (result.error) {
      setError(result.error);
    } else {
      setUploadedFile(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setUploadedFile(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Upload Book" size="md">
      <div className="space-y-6">
        {!uploadedFile ? (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'border border-[var(--border-primary)] p-12 text-center cursor-pointer transition-all duration-[50ms]',
                isDragging
                  ? 'border-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                  : 'hover:border-[var(--border-strong)] hover:bg-[var(--bg-secondary)]'
              )}
            >
              <div className={clsx(
                'w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center',
                isDragging && 'border-[var(--text-primary)] bg-[var(--text-primary)]'
              )}>
                <PixelIcon
                  name="upload"
                  size={32}
                  className={isDragging ? 'text-[var(--bg-primary)]' : 'text-[var(--text-tertiary)]'}
                />
              </div>
              <p className="font-ui fs-p-sm uppercase tracking-[0.05em] mb-2">
                Drop file here or click to browse
              </p>
              <p className="font-mono fs-p-sm text-[var(--text-tertiary)]">
                EPUB, PDF, MOBI (max 100MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        ) : (
          <div className="border border-[var(--border-primary)] p-4 bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center">
                <PixelIcon name="book" size={20} className="text-[var(--text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui fs-p-sm uppercase tracking-[0.02em] truncate">{uploadedFile.name}</p>
                <p className="font-mono fs-p-sm text-[var(--text-secondary)]">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="p-2 hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-primary)] transition-all duration-[50ms]"
              >
                <PixelIcon name="close" size={14} className="text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 border border-[var(--text-primary)] bg-[var(--bg-secondary)]">
            <p className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleUpload}
            disabled={!uploadedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
