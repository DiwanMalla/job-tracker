import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/document.service';
import { saveFile, FileUploadError } from '@/lib/upload';
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
    const name = formData.get('name') as string;

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

    // Save file to disk
    const uploadResult = await saveFile(file, type);

    // Save to database
    const document = await DocumentService.create(session.user.id, {
      name: name || file.name,
      type,
      buffer: Buffer.from(await file.arrayBuffer()),
      originalName: file.name,
      size: file.size,
    });

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
    
    if (error instanceof FileUploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
