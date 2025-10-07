// Document Service - Single Responsibility: File management
import { prisma } from '@/lib/prisma';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Document, DocumentType } from '@/types';

export class DocumentService {
  private static uploadsDir = join(process.cwd(), 'uploads');

  static async create(
    userId: string,
    file: {
      name: string;
      type: DocumentType;
      buffer: Buffer;
      originalName: string;
      size: number;
    }
  ): Promise<Document> {
    // Ensure uploads directory exists
    try {
      await mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileId = uuidv4();
    const extension = file.originalName.split('.').pop() || '';
    const fileName = `${fileId}.${extension}`;
    const filePath = join(this.uploadsDir, fileName);

    // Write file to disk
    await writeFile(filePath, file.buffer);

    // Save to database
    return prisma.document.create({
      data: {
        userId,
        name: file.name,
        type: file.type,
        filePath: fileName, // Store relative path
        originalName: file.originalName,
        size: file.size,
      },
    });
  }

  static async findById(id: string, userId: string): Promise<Document | null> {
    return prisma.document.findFirst({
      where: { id, userId },
    });
  }

  static async findByUser(userId: string, type?: DocumentType): Promise<Document[]> {
    const where: Record<string, unknown> = { userId };
    if (type) {
      where.type = type;
    }

    return prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    const document = await this.findById(id, userId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from disk
    const fullPath = join(this.uploadsDir, document.filePath);
    try {
      await unlink(fullPath);
    } catch (error) {
      // File might not exist, continue with database deletion
    }

    // Delete from database
    await prisma.document.delete({
      where: { id, userId },
    });
  }

  static getFilePath(document: Document): string {
    return join(this.uploadsDir, document.filePath);
  }
}