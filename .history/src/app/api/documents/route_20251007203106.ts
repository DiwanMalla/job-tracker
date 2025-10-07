import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
// Use Vercel Blob service for production, fallback to local for development
import { DocumentService } from '@/lib/services/document-vercel.service';
import type { DocumentType } from '@/types';

// GET /api/documents - List user's documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as DocumentType | null;

    const documents = await DocumentService.findByUser(
      session.user.id,
      type || undefined
    );

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload a new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as DocumentType;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'RESUME' && type !== 'COVER_LETTER')) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob and save to database
    const document = await DocumentService.create(
      session.user.id,
      file,
      type
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    );
  }
}
