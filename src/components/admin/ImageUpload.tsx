import React, { useState, useRef } from 'react';
import { uploadImage, validateImage } from '../../services/uploadService';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  folder: 'doctors' | 'testimonials' | 'departments' | 'general';
  placeholder?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder,
  placeholder = 'Click or drag to upload image'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate the file
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    setIsUploading(true);
    try {
      const result = await uploadImage(file, folder);
      if (result.success && result.data) {
        onImageUploaded(result.data.url);
        setPreviewUrl(result.data.url);
      } else {
        setError(result.message || 'Upload failed');
        setPreviewUrl(currentImageUrl || null);
      }
    } catch {
      setError('Upload failed. Please try again.');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemoved?.();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    border: `2px dashed ${isDragOver ? '#15C9FA' : error ? '#EF4444' : '#E5E7EB'}`,
    borderRadius: '12px',
    backgroundColor: isDragOver ? '#F0FDFF' : '#FAFAFA',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden'
  };

  const uploadAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    textAlign: 'center'
  };

  const previewContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6'
  };

  const previewImageStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const loadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  };

  const spinnerStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    border: '3px solid #E5E7EB',
    borderTopColor: '#15C9FA',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div
      style={containerStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !previewUrl && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div 
          style={previewContainerStyle}
          onMouseEnter={(e) => {
            const overlay = e.currentTarget.querySelector('.image-overlay') as HTMLElement;
            if (overlay) overlay.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const overlay = e.currentTarget.querySelector('.image-overlay') as HTMLElement;
            if (overlay) overlay.style.opacity = '0';
          }}
        >
          <img src={previewUrl} alt="Preview" style={previewImageStyle} />
          
          <div className="image-overlay" style={overlayStyle}>
            <button
              type="button"
              style={iconButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              title="Change image"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#15C9FA">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              style={iconButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              title="Remove image"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#EF4444">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {isUploading && (
            <div style={loadingOverlayStyle}>
              <div style={spinnerStyle} />
              <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <div style={uploadAreaStyle}>
          <svg 
            width="48" 
            height="48" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={isDragOver ? '#15C9FA' : '#9CA3AF'}
            style={{ marginBottom: '12px' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{placeholder}</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            PNG, JPG, GIF or WebP (max 5MB)
          </p>
          
          {isUploading && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={spinnerStyle} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Uploading...</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 12px',
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ImageUpload;
