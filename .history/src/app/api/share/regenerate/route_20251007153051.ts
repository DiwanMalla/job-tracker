import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ShareService } from '@/lib/services/share.service';

// POST /api/share/regenerate - Regenerate share ID
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await ShareService.regenerateShareId(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Share link regenerated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Error regenerating share link:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate share link' },
      { status: 500 }
    );
  }
}