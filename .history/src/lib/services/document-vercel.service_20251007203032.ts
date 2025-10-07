// Document Service - Single Responsibility: File management with Vercel Blob
import { prisma } from "@/lib/prisma";
import { uploadToVercelBlob, deleteFromVercelBlob } from "@/lib/upload-vercel";
import type { Document, DocumentType } from "@/types";

export class DocumentService {
  static async create(
    userId: string,
    file: File,
    type: DocumentType
  ): Promise<Document> {
    // Upload to Vercel Blob
    const { url, pathname } = await uploadToVercelBlob(
      file,
      userId,
      type === 'RESUME' ? 'resume' : 'cover-letter'
    );

    // Save to database
    return prisma.document.create({
      data: {
        userId,
        name: file.name,
        type,
        filePath: url, // Store the Vercel Blob URL
        originalName: file.name,
        size: file.size,
      },
    });
  }

  static async findById(id: string, userId: string): Promise<Document | null> {
    return prisma.document.findFirst({
      where: { id, userId },
    });
  }

  static async findByUser(
    userId: string,
    type?: DocumentType
  ): Promise<Document[]> {
    const where: Record<string, unknown> = { userId };
    if (type) {
      where.type = type;
    }

    return prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    const document = await this.findById(id, userId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete from Vercel Blob
    await deleteFromVercelBlob(document.filePath);

    // Delete from database
    await prisma.document.delete({
      where: { id, userId },
    });
  }

  static getFileUrl(document: Document): string {
    // Return the Vercel Blob URL directly
    return document.filePath;
  }
}
