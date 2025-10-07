import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { JobApplicationService } from '@/lib/services/job-application.service';
import { createJobApplicationSchema, paginationSchema } from '@/lib/validations';
import type { DashboardFilters } from '@/types';

// GET /api/applications - Fetch user's job applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const { page, limit } = paginationResult.data;

    // Parse filter parameters
    const filters: DashboardFilters = {};
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')?.split(',');
    }
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }
    
    if (searchParams.get('sortBy')) {
      filters.sortBy = searchParams.get('sortBy');
    }
    
    if (searchParams.get('sortOrder')) {
      filters.sortOrder = searchParams.get('sortOrder');
    }

    if (searchParams.get('startDate') && searchParams.get('endDate')) {
      filters.dateRange = {
        start: new Date(searchParams.get('startDate')!),
        end: new Date(searchParams.get('endDate')!),
      };
    }

    const result = await JobApplicationService.findAll(
      session.user.id,
      filters,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new job application
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = createJobApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const application = await JobApplicationService.create(
      session.user.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      message: 'Job application created successfully',
      data: application,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500 }
    );
  }
}