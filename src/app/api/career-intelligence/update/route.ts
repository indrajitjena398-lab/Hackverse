import { NextRequest, NextResponse } from 'next/server';
import { crossModuleCoherenceEngine } from '@/lib/engine/CrossModuleCoherenceEngine';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, field, value, reason } = body;

    if (!userId || !field) {
      return NextResponse.json(
        { success: false, error: 'userId and field are required' },
        { status: 400 }
      );
    }

    const updated = crossModuleCoherenceEngine.updateProfileField(
      userId,
      field,
      value,
      reason || 'Profile update via API'
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update profile field' },
      { status: 500 }
    );
  }
}
