// Share Service - Single Responsibility: Public sharing functionality
import { prisma } from '@/lib/prisma';
import { generateShareId } from '@/lib/utils';
import type { ShareSettings } from '@/types';

export class ShareService {
  static async createOrUpdate(
    userId: string,
    settings: {
      showNotes: boolean;
      showDocuments: boolean;
      expiresAt?: Date;
    }
  ): Promise<ShareSettings> {
    // Check if share settings already exist
    const existing = await prisma.shareSettings.findFirst({
      where: { userId },
    });

    if (existing) {
      return prisma.shareSettings.update({
        where: { id: existing.id },
        data: {
          ...settings,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    }

    // Create new share settings
    return prisma.shareSettings.create({
      data: {
        userId,
        shareId: generateShareId(),
        isActive: true,
        ...settings,
      },
    });
  }

  static async findByUserId(userId: string): Promise<ShareSettings | null> {
    return prisma.shareSettings.findFirst({
      where: { userId },
    });
  }

  static async findByShareId(shareId: string): Promise<ShareSettings | null> {
    return prisma.shareSettings.findFirst({
      where: { 
        shareId, 
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: true,
      },
    });
  }

  static async deactivate(userId: string): Promise<void> {
    await prisma.shareSettings.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  static async regenerateShareId(userId: string): Promise<ShareSettings> {
    const settings = await this.findByUserId(userId);
    if (!settings) {
      throw new Error('Share settings not found');
    }

    return prisma.shareSettings.update({
      where: { id: settings.id },
      data: {
        shareId: generateShareId(),
        updatedAt: new Date(),
      },
    });
  }
}