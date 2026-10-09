import { NextRequest, NextResponse } from 'next/server';
import { placementDispatchStore } from '@/lib/engine/PlacementDispatchStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const notices = placementDispatchStore.getNoticesForStudent('');
    return NextResponse.json({
      success: true,
      data: notices,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch institutional notices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dispatchId, studentEmail, studentName, customAdvisory, priority } = body;

    if (!dispatchId || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'dispatchId and studentEmail are required' },
        { status: 400 }
      );
    }

    const createdNotice = placementDispatchStore.sendInstitutionalNotice(
      dispatchId,
      studentEmail,
      studentName || 'Student',
      customAdvisory,
      priority || 'HIGH'
    );

    if (!createdNotice) {
      return NextResponse.json(
        { success: false, error: 'Dispatch or student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: createdNotice,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to dispatch institutional notice' },
      { status: 500 }
    );
  }
}
