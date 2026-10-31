'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileText, AlertCircle, Loader2, Download, Trash2 } from 'lucide-react';
import { StorageService } from '../../services';

interface DocumentUploaderProps {
  entityType?: string;
  entityId?: string;
  onUploadSuccess?: (file: { id: string; fileName: string; url: string }) => void;
  title?: string;
  maxSizeMB?: number;
}

export function DocumentUploader({
  entityType = 'ATTACHMENT',
  entityId,
  onUploadSuccess,
  title = 'Upload Document to Neon PostgreSQL (BYTEA)',
  maxSizeMB = 15,
}: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    fileName: string;
    fileSize: number;
    url: string;
    downloadUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds limit of ${maxSizeMB} MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Read file as Base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const res = await StorageService.uploadFile({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileData: base64Data,
          entityType,
          entityId,
        });

        if (res.success && res.data?.file) {
          setUploadedFile(res.data.file);
          if (onUploadSuccess) {
            onUploadSuccess(res.data.file);
          }
        } else {
          setError(res.message || 'Failed to upload file to Neon database storage');
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        setError('Error reading file data');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-gold/30 bg-navy-900/60 backdrop-blur-sm text-cream space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gold" />
          <h4 className="text-sm font-semibold text-cream">{title}</h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-gold/15 text-gold font-medium">
          Neon BYTEA Max {maxSizeMB}MB
        </span>
      </div>

      {!uploadedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gold/30 hover:border-gold/60 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-navy-950/40 hover:bg-navy-950/70"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-gold">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-medium">Writing binary data into Neon PostgreSQL BYTEA column...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-cream-300">
              <UploadCloud className="w-8 h-8 text-gold" />
              <p className="text-sm font-medium text-cream">Click or drag file to upload</p>
              <p className="text-xs text-cream-400">PDFs, Signed Agreements, Photos & Invoices up to {maxSizeMB}MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-cream truncate max-w-xs">{uploadedFile.fileName}</p>
              <p className="text-xs text-emerald-300">
                {(uploadedFile.fileSize / 1024).toFixed(1)} KB • Stored in Neon PostgreSQL
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={uploadedFile.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md hover:bg-white/10 text-gold transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => setUploadedFile(null)}
              className="p-1.5 rounded-md hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Upload another"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-400 text-xs p-2 rounded bg-rose-950/40 border border-rose-800/40">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
