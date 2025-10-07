// Vercel Blob Storage Upload Utilities
import { put, del } from '@vercel/blob';

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export function validateFile(file: File): void {
  // Check file type
  if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    throw new FileUploadError(
      'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileUploadError(
      `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`
    );
  }
}

export async function uploadToVercelBlob(
  file: File,
  userId: string,
  documentType: 'resume' | 'cover-letter'
): Promise<{ url: string; pathname: string }> {
  validateFile(file);

  const timestamp = Date.now();
  const extension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
  const filename = `${userId}/${documentType}/${timestamp}.${extension}`;

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function deleteFromVercelBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    // Don't throw error - file might already be deleted
  }
}
