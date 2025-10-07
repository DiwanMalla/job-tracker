import { z } from "zod";
import { ApplicationStatus } from "@/types";

// Job Application validation schema
export const createJobApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  position: z.string().min(1, "Position is required").max(255),
  description: z.string().optional(),
  requirements: z.string().optional(),
  location: z.string().optional(),
  salary: z.number().positive().optional().nullable(),
  applicationDate: z.string().or(z.date()),
  status: z.nativeEnum(ApplicationStatus),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  followUpDate: z.string().or(z.date()).optional().nullable(),
  resumeId: z.string().optional().nullable(),
  coverLetterId: z.string().optional().nullable(),
});

export const updateJobApplicationSchema = createJobApplicationSchema.partial();

// Pagination schema
export const paginationSchema = z.object({
  page: z
    .string()
    .or(z.number())
    .transform((val) => parseInt(val.toString(), 10))
    .default(1),
  limit: z
    .string()
    .or(z.number())
    .transform((val) => parseInt(val.toString(), 10))
    .default(10),
});

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Share settings schema
export const shareSettingsSchema = z.object({
  isActive: z.boolean().optional().default(true),
  showNotes: z.boolean().default(false),
  showDocuments: z.boolean().default(false),
  expiresAt: z.preprocess(
    (val) => {
      if (!val || val === '' || val === null) return undefined;
      if (typeof val === 'string') return new Date(val);
      return val;
    },
    z.date().optional()
  ),
});
