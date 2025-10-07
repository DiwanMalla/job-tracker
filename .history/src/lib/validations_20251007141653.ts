import { z } from 'zod';
import { ApplicationStatus, DocumentType } from '@/types';

// Base validation schemas following DRY principle

// User validation schemas
export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const createUserSchema = userSchema.omit({ id: true });

// Job Application validation schemas
export const jobApplicationSchema = z.object({
  id: z.string().cuid(),
  companyName: z.string().min(1, 'Company name is required').max(200),
  position: z.string().min(1, 'Position is required').max(200),
  applicationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  status: z.nativeEnum(ApplicationStatus),
  jobUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(2000, 'Notes too long').optional(),
  followUpDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional().or(z.literal('')),
  resumeId: z.string().cuid().optional(),
  coverLetterId: z.string().cuid().optional(),
});

export const createJobApplicationSchema = jobApplicationSchema.omit({ id: true });

export const updateJobApplicationSchema = jobApplicationSchema.partial().extend({
  id: z.string().cuid(),
});

// Document validation schemas
export const documentSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Document name is required'),
  type: z.nativeEnum(DocumentType),
  originalName: z.string().min(1, 'Original filename is required'),
  size: z.number().positive('File size must be positive'),
});

export const createDocumentSchema = documentSchema.omit({ id: true });

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (typeof File !== 'undefined' && file instanceof File) {
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return allowedTypes.includes(file.type);
    }
    return false;
  }, 'Only PDF and Word documents are allowed'),
  type: z.nativeEnum(DocumentType),
});

// Share settings validation schemas
export const shareSettingsSchema = z.object({
  id: z.string().cuid(),
  shareId: z.string().min(10, 'Share ID too short'),
  isActive: z.boolean(),
  showNotes: z.boolean(),
  showDocuments: z.boolean(),
  expiresAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional(),
});

export const createShareSettingsSchema = shareSettingsSchema.omit({ id: true });

export const updateShareSettingsSchema = shareSettingsSchema.partial().extend({
  id: z.string().cuid(),
});

// Dashboard filter validation
export const dashboardFiltersSchema = z.object({
  status: z.array(z.nativeEnum(ApplicationStatus)).optional(),
  dateRange: z.object({
    start: z.string().refine((date) => !isNaN(Date.parse(date))),
    end: z.string().refine((date) => !isNaN(Date.parse(date))),
  }).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['applicationDate', 'companyName', 'position', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// API query parameters validation
export const paginationSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0, {
    message: 'Page must be greater than 0'
  }).optional().default(() => 1),
  limit: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 100, {
    message: 'Limit must be between 1 and 100'
  }).optional().default(() => 10),
});

// Authentication validation schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});