const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

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
  const token = getAuthToken();
  
  if (!token) {
    return {
      success: false,
      message: 'Authentication required'
    };
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  try {
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    return result;
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
  const token = getAuthToken();
  
  if (!token) {
    return {
      success: false,
      message: 'Authentication required'
    };
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images[]', file);
  });
  formData.append('folder', folder);

  try {
    const response = await fetch(`${API_BASE_URL}/images/upload-multiple`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    return result;
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
  const token = getAuthToken();
  
  if (!token) {
    return {
      success: false,
      message: 'Authentication required'
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/images/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ path })
    });

    const result = await response.json();
    return result;
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
