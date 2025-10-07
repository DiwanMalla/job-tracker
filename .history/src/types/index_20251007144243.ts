// Import Prisma generated types for consistency
import type { 
  User as PrismaUser,
  JobApplication as PrismaJobApplication,
  Document as PrismaDocument,
  ShareSettings as PrismaShareSettings,
  ApplicationStatus,
  DocumentType
} from '@prisma/client';

// Export Prisma types as our main types
export type User = PrismaUser;
export type JobApplication = PrismaJobApplication & {
  resume?: Document | null;
  coverLetter?: Document | null;
};
export type Document = PrismaDocument;
export type ShareSettings = PrismaShareSettings;

// Re-export enums from Prisma
export { ApplicationStatus, DocumentType } from '@prisma/client';

// Form types for validation
export interface CreateJobApplicationForm {
  companyName: string;
  position: string;
  description?: string;
  requirements?: string;
  location?: string;
  salary?: number;
  applicationDate: string;
  status: ApplicationStatus;
  jobUrl?: string;
  notes?: string;
  followUpDate?: string;
  resumeId?: string;
  coverLetterId?: string;
}

export interface UpdateJobApplicationForm extends Partial<CreateJobApplicationForm> {
  id: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard filter types
export interface DashboardFilters {
  status?: ApplicationStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  sortBy?: 'applicationDate' | 'companyName' | 'position' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// File upload types
export interface FileUploadResult {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: DocumentType;
}