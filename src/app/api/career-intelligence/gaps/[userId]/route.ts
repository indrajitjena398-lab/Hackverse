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
        skillGaps: profile.skillGaps,
        count: profile.skillGaps.length,
        criticalGaps: profile.skillGaps.filter(g => g.severity === 'CRITICAL'),
        recommendedRemedies: profile.skillGaps.map(g => ({
          skill: g.skill,
          action: g.remedyAction,
          learningTopic: g.suggestedLearningTopic,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve skill gaps' },
      { status: 500 }
    );
  }
}
