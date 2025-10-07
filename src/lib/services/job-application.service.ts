// Service classes following SOLID principles - Single Responsibility Principle

import { prisma } from '@/lib/prisma';
import type { 
  JobApplication, 
  CreateJobApplicationForm, 
  UpdateJobApplicationForm,
  DashboardFilters,
  PaginatedResponse 
} from '@/types';


// JobApplicationService - Single Responsibility: Managing job applications
export class JobApplicationService {
  static async create(userId: string, data: CreateJobApplicationForm): Promise<JobApplication> {
    return prisma.jobApplication.create({
      data: {
        ...data,
        userId,
        applicationDate: new Date(data.applicationDate),
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
      include: {
        resume: true,
        coverLetter: true,
      },
    });
  }

  static async findById(id: string, userId: string): Promise<JobApplication | null> {
    return prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        resume: true,
        coverLetter: true,
      },
    });
  }

  static async findAll(
    userId: string, 
    filters: DashboardFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<JobApplication>> {
    const where: Record<string, unknown> = { userId };

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.dateRange) {
      where.applicationDate = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    if (filters.search) {
      where.OR = [
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { position: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.applicationDate = 'desc';
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          resume: true,
          coverLetter: true,
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id: string, userId: string, data: UpdateJobApplicationForm): Promise<JobApplication> {
    const updateData: Record<string, unknown> = { ...data };
    
    if (data.applicationDate) {
      updateData.applicationDate = new Date(data.applicationDate);
    }
    
    if (data.followUpDate) {
      updateData.followUpDate = new Date(data.followUpDate);
    }

    return prisma.jobApplication.update({
      where: { id, userId },
      data: updateData,
      include: {
        resume: true,
        coverLetter: true,
      },
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    await prisma.jobApplication.delete({
      where: { id, userId },
    });
  }

  static async findByShareId(shareId: string): Promise<JobApplication[] | null> {
    const shareSettings = await prisma.shareSettings.findFirst({
      where: { 
        shareId, 
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: {
          include: {
            applications: {
              include: {
                resume: true,
                coverLetter: true,
              },
            },
          },
        },
      },
    });

    if (!shareSettings) return null;

    // Filter applications based on share settings
    return shareSettings.user.applications.map(app => ({
      ...app,
      notes: shareSettings.showNotes ? app.notes : null,
      resume: shareSettings.showDocuments ? app.resume : null,
      coverLetter: shareSettings.showDocuments ? app.coverLetter : null,
    }));
  }
}