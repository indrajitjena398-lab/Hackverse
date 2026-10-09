import { NextRequest, NextResponse } from 'next/server';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'guest_candidate';
    const prefs = feedbackAnalysisEngine.getUserPreferences(userId);

    return NextResponse.json({
      success: true,
      data: prefs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || body.user_id || 'guest_candidate';

    const current = feedbackAnalysisEngine.getUserPreferences(userId);
    const updated = {
      ...current,
      ...body,
      preferred_roles: {
        ...current.preferred_roles,
        ...(body.preferred_roles || {}),
      },
      disliked_roles: {
        ...current.disliked_roles,
        ...(body.disliked_roles || {}),
      },
      corrected_skills: {
        ...current.corrected_skills,
        ...(body.corrected_skills || {}),
      },
      last_updated: new Date().toISOString(),
    };

    feedbackAnalysisEngine.saveUserPreferences(userId, updated);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
