import { NextRequest, NextResponse } from 'next/server';
import { placementDispatchStore } from '@/lib/engine/PlacementDispatchStore';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);
    const notices = placementDispatchStore.getNoticesForStudent(email);

    return NextResponse.json({
      success: true,
      data: notices,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch student notices' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const body = await req.json();
    const { noticeId } = body;

    if (!noticeId) {
      return NextResponse.json(
        { success: false, error: 'noticeId is required' },
        { status: 400 }
      );
    }

    const ok = placementDispatchStore.acknowledgeNotice(noticeId);

    return NextResponse.json({
      success: ok,
      message: ok ? 'Notice marked acknowledged' : 'Notice not found',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to acknowledge notice' },
      { status: 500 }
    );
  }
}
