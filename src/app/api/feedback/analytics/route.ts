import { NextResponse } from 'next/server';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const summary = feedbackAnalysisEngine.getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate feedback analytics' },
      { status: 500 }
    );
  }
}
