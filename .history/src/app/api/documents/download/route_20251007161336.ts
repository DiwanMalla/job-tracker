import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/document.service';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

// GET /api/documents/download?id=xxx - Download a document
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const document = await DocumentService.findById(id, session.user.id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const filePath = DocumentService.getFilePath(document);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    // Determine content type
    const contentType = document.originalName.endsWith('.pdf')
      ? 'application/pdf'
      : document.originalName.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : document.originalName.endsWith('.doc')
      ? 'application/msword'
      : 'application/octet-stream';

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${document.originalName}"`,
        'Content-Length': document.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
