import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

// Allowed file types and their extensions
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
};

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  fileName: string;
  originalName: string;
  filePath: string;
  size: number;
  type: string;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): void {
  // Check file type
  if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
    throw new FileUploadError(
      'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileUploadError(
      `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    );
  }

  // Check if file has content
  if (file.size === 0) {
    throw new FileUploadError('File is empty.');
  }
}

/**
 * Generate unique filename
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  return `${timestamp}-${randomString}${ext}`;
}

/**
 * Get upload directory path based on document type
 */
export function getUploadDir(type: 'RESUME' | 'COVER_LETTER'): string {
  const baseDir = path.join(process.cwd(), 'uploads');
  return type === 'RESUME' 
    ? path.join(baseDir, 'resumes')
    : path.join(baseDir, 'cover-letters');
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(type: 'RESUME' | 'COVER_LETTER'): Promise<void> {
  const dir = getUploadDir(type);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Save uploaded file to disk
 */
export async function saveFile(
  file: File,
  type: 'RESUME' | 'COVER_LETTER'
): Promise<UploadResult> {
  // Validate file
  validateFile(file);

  // Ensure upload directory exists
  await ensureUploadDir(type);

  // Generate unique filename
  const fileName = generateFileName(file.name);

  // Get upload directory
  const uploadDir = getUploadDir(type);
  const filePath = path.join(uploadDir, fileName);

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file to disk
  await writeFile(filePath, buffer);

  return {
    fileName,
    originalName: file.name,
    filePath: filePath.replace(process.cwd(), ''), // Relative path
    size: file.size,
    type: file.type,
  };
}

/**
 * Delete file from disk
 */
export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (existsSync(fullPath)) {
    await unlink(fullPath);
  }
}

/**
 * Get file URL for download
 */
export function getFileUrl(filePath: string): string {
  return filePath.replace('/uploads/', '/api/documents/download?file=');
}
