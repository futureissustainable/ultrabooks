'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { useBookStore } from '@/lib/stores/book-store';
import { Button, Modal } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface BookUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadResult {
  successCount: number;
  failedFiles: { name: string; error: string }[];
}

export function BookUpload({ isOpen, onClose }: BookUploadProps) {
  const { uploadBook, uploadBooks, isUploading, uploadProgress, quota, fetchQuota } = useBookStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['.epub', '.pdf', '.mobi'];

  // Fetch quota when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchQuota();
    }
  }, [isOpen, fetchQuota]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return { valid: false, error: `Invalid file type: ${file.name}` };
    }
    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      return { valid: false, error: `File too large: ${file.name} (max 100MB)` };
    }
    return { valid: true };
  };

  const validateFiles = (files: File[]): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const result = validateFile(file);
      if (result.valid) {
        validFiles.push(file);
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    return { validFiles, errors };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setUploadResult(null);

    const files = Array.from(e.dataTransfer.files);
    const { validFiles, errors } = validateFiles(files);

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadResult(null);
    const files = Array.from(e.target.files || []);
    const { validFiles, errors } = validateFiles(files);

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input so same files can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadResult(null);

    if (selectedFiles.length === 1) {
      const result = await uploadBook(selectedFiles[0]);
      if (result.error) {
        setError(result.error);
      } else {
        setSelectedFiles([]);
        onClose();
      }
    } else {
      const result = await uploadBooks(selectedFiles);
      if (result.failed.length > 0) {
        setUploadResult({
          successCount: result.successful.length,
          failedFiles: result.failed.map(f => ({ name: f.file.name, error: f.error }))
        });
      }
      if (result.successful.length > 0 && result.failed.length === 0) {
        setSelectedFiles([]);
        onClose();
      } else if (result.successful.length > 0) {
        // Remove successful files from selection, keep failed ones
        const failedNames = new Set(result.failed.map(f => f.file.name));
        setSelectedFiles(prev => prev.filter(f => failedNames.has(f.name)));
      }
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    setError(null);
    setUploadResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Upload Books" size="md">
      <div className="space-y-6">
        {/* Quota Info */}
        {quota && (
          <div className="p-3 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span className="font-mono fs-p-sm">Today: {quota.daily_remaining}/{quota.daily_limit}</span>
              <span className="font-mono fs-p-sm">Total: {quota.total_remaining.toLocaleString()}/{quota.total_limit.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border border-[var(--border-primary)] p-8 text-center cursor-pointer transition-all duration-[50ms]',
            isDragging
              ? 'border-[var(--text-primary)] bg-[var(--bg-tertiary)]'
              : 'hover:border-[var(--border-strong)] hover:bg-[var(--bg-secondary)]'
          )}
        >
          <div className={clsx(
            'w-12 h-12 mx-auto mb-4 border border-[var(--border-primary)] flex items-center justify-center',
            isDragging && 'border-[var(--text-primary)] bg-[var(--text-primary)]'
          )}>
            <PixelIcon
              name="upload"
              size={24}
              className={isDragging ? 'text-[var(--bg-primary)]' : 'text-[var(--text-tertiary)]'}
            />
          </div>
          <p className="font-ui fs-p-sm uppercase tracking-[0.05em] mb-2">
            Drop files here or click to browse
          </p>
          <p className="font-mono fs-p-sm text-[var(--text-tertiary)]">
            EPUB, PDF, MOBI (max 100MB each)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="border border-[var(--border-primary)] divide-y divide-[var(--border-primary)] max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="p-3 bg-[var(--bg-secondary)] flex items-center gap-3">
                <div className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center flex-shrink-0">
                  <PixelIcon name="book" size={16} className="text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui fs-p-sm uppercase tracking-[0.02em] truncate">{file.name}</p>
                  <p className="font-mono fs-p-sm text-[var(--text-tertiary)]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                  className="p-1.5 hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-primary)] transition-all duration-[50ms]"
                  disabled={isUploading}
                >
                  <PixelIcon name="close" size={12} className="text-[var(--text-secondary)]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress && (
          <div className="p-3 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="flex justify-between mb-2">
              <span className="font-ui fs-p-sm uppercase tracking-[0.02em]">
                Uploading {uploadProgress.current} of {uploadProgress.total}
              </span>
              <span className="font-mono fs-p-sm text-[var(--text-secondary)]">
                {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
              </span>
            </div>
            <div className="h-1 bg-[var(--bg-tertiary)]">
              <div
                className="h-full bg-[var(--text-primary)] transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
            <p className="font-mono fs-p-sm text-[var(--text-tertiary)] mt-2 truncate">
              {uploadProgress.currentFile}
            </p>
          </div>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <div className="p-3 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            {uploadResult.successCount > 0 && (
              <p className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-secondary)] mb-2">
                {uploadResult.successCount} book{uploadResult.successCount !== 1 ? 's' : ''} uploaded successfully
              </p>
            )}
            {uploadResult.failedFiles.length > 0 && (
              <div>
                <p className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)] mb-1">
                  {uploadResult.failedFiles.length} failed:
                </p>
                <ul className="font-mono fs-p-sm text-[var(--text-tertiary)]">
                  {uploadResult.failedFiles.map((f, i) => (
                    <li key={i} className="truncate">{f.name}: {f.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 border border-[var(--text-primary)] bg-[var(--bg-secondary)]">
            <p className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload${selectedFiles.length > 1 ? ` (${selectedFiles.length})` : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
