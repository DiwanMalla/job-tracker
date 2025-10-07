// Core entity types following Single Responsibility Principle

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  applicationDate: Date;
  status: ApplicationStatus;
  jobUrl?: string;
  notes?: string;
  followUpDate?: Date;
  resumeId?: string;
  coverLetterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  filePath: string;
  originalName: string;
  size: number;
  createdAt: Date;
}

export interface ShareSettings {
  id: string;
  userId: string;
  shareId: string;
  isActive: boolean;
  showNotes: boolean;
  showDocuments: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enums for type safety
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum DocumentType {
  RESUME = 'RESUME',
  COVER_LETTER = 'COVER_LETTER'
}

// Form types for validation
export interface CreateJobApplicationForm {
  companyName: string;
  position: string;
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