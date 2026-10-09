import { NextRequest, NextResponse } from 'next/server';
import { crossModuleCoherenceEngine } from '@/lib/engine/CrossModuleCoherenceEngine';
import { CoherenceEvent } from '@/lib/types/careerIntelligence';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.eventType || !body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId and eventType are required' },
        { status: 400 }
      );
    }

    const event: CoherenceEvent = {
      eventId: body.eventId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: body.userId,
      module: body.module || 'system_coordinator',
      eventType: body.eventType,
      payload: body.payload || body.data || {},
      evidence: body.evidence,
      confidence: body.confidence !== undefined ? body.confidence : 1.0,
      timestamp: body.timestamp || new Date().toISOString(),
      parentEventId: body.parentEventId,
      processedBy: body.processedBy || []
    };

    const result = crossModuleCoherenceEngine.processCoherenceEvent(event);
    const updatedProfile = crossModuleCoherenceEngine.getProfile(body.userId);

    return NextResponse.json({
      success: result.success,
      data: {
        actionsTriggered: result.actionsTriggered,
        currentReadiness: updatedProfile.careerReadinessScore,
        profileVersion: updatedProfile.version,
        lastUpdated: updatedProfile.lastUpdated,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process coherence event' },
      { status: 500 }
    );
  }
}
