import { NextRequest, NextResponse } from 'next/server';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const all = feedbackAnalysisEngine.getAnalyticsSummary().recentFeedbacks;
    const record = all.find(f => f.feedback_id === params.id);

    if (!record) {
      return NextResponse.json({ success: false, error: 'Feedback record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error fetching feedback' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = feedbackAnalysisEngine.updateFeedback(params.id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Feedback record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error updating feedback' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = feedbackAnalysisEngine.deleteFeedback(params.id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error deleting feedback' }, { status: 500 });
  }
}
