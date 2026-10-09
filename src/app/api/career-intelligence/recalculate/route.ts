import { NextRequest, NextResponse } from 'next/server';
import { crossModuleCoherenceEngine } from '@/lib/engine/CrossModuleCoherenceEngine';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'candidate@pmec.ac.in';

    // Trigger recalculation event
    const result = crossModuleCoherenceEngine.processCoherenceEvent({
      eventId: `recalc-${Date.now()}`,
      userId,
      module: 'system_coordinator',
      eventType: 'CIP_RECALCULATED',
      payload: { reason: 'Manual or automated cascade recalculation requested' },
      confidence: 1.0,
      timestamp: new Date().toISOString()
    });

    const profile = crossModuleCoherenceEngine.getProfile(userId);

    return NextResponse.json({
      success: true,
      data: {
        readinessScore: profile.careerReadinessScore,
        aiConfidenceScores: profile.aiConfidenceScores,
        version: profile.version,
        lastUpdated: profile.lastUpdated,
        actionsTriggered: result.actionsTriggered
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to recalculate profile' },
      { status: 500 }
    );
  }
}
