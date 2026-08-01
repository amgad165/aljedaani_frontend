import apiClient from './apiClient';

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    path: string;
    filename: string;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

interface MultiUploadResponse {
  success: boolean;
  data?: Array<{
    url: string;
    path: string;
    filename: string;
  }>;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Upload a single image to S3
 * @param file The file to upload
 * @param folder The folder to upload to (doctors, testimonials, departments, general)
 * @returns The upload response with the S3 URL
 */
export const uploadImage = async (
  file: File,
  folder: 'doctors' | 'testimonials' | 'departments' | 'general' = 'general'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  try {
    return await apiClient.post<UploadResponse>('/images/upload', formData, {
      'Content-Type': 'multipart/form-data',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Upload multiple images to S3
 * @param files The files to upload
 * @param folder The folder to upload to
 * @returns The upload response with S3 URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: 'doctors' | 'testimonials' | 'departments' | 'general' = 'general'
): Promise<MultiUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images[]', file);
  });
  formData.append('folder', folder);

  try {
    return await apiClient.post<MultiUploadResponse>('/images/upload-multiple', formData, {
      'Content-Type': 'multipart/form-data',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Delete an image from S3
 * @param path The S3 path of the image to delete
 * @returns The delete response
 */
export const deleteImage = async (path: string): Promise<{ success: boolean; message?: string }> => {
  try {
    return await apiClient.delete<{ success: boolean; message?: string }>('/images/delete', {
      path,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

/**
 * Validate image file before upload
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns Validation result
 */
export const validateImage = (
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  validateImage
};
