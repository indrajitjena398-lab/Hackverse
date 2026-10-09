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
      data: {
        primaryTargetRole: profile.primaryTargetRole,
        targetRoles: profile.targetRoles,
        targetIndustries: profile.targetIndustries,
        careerGoals: profile.careerGoals,
        readinessScore: profile.careerReadinessScore,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve goals' },
      { status: 500 }
    );
  }
}
