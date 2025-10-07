import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ShareService } from '@/lib/services/share.service';
import { shareSettingsSchema } from '@/lib/validations';

// GET /api/share - Get user's share settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await ShareService.findByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching share settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share settings' },
      { status: 500 }
    );
  }
}

// POST /api/share - Create or update share settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = shareSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const settings = await ShareService.createOrUpdate(
      session.user.id,
      {
        showNotes: data.showNotes,
        showDocuments: data.showDocuments,
        expiresAt: data.expiresAt,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Share settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating share settings:', error);
    return NextResponse.json(
      { error: 'Failed to update share settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/share - Delete share settings (disable sharing)
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ShareService.deactivate(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Sharing disabled successfully',
    });
  } catch (error) {
    console.error('Error deleting share settings:', error);
    return NextResponse.json(
      { error: 'Failed to disable sharing' },
      { status: 500 }
    );
  }
}