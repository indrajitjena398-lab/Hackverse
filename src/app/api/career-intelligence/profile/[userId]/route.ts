import { NextRequest, NextResponse } from 'next/server';
import { crossModuleCoherenceEngine } from '@/lib/engine/CrossModuleCoherenceEngine';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = decodeURIComponent(params.userId);
    const profile = crossModuleCoherenceEngine.getProfile(userId);
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = decodeURIComponent(params.userId);
    const body = await req.json();
    const { field, value, reason } = body;

    if (!field) {
      return NextResponse.json(
        { success: false, error: 'Field to update is required' },
        { status: 400 }
      );
    }

    const updated = crossModuleCoherenceEngine.updateProfileField(
      userId,
      field,
      value,
      reason || 'Direct profile update'
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
