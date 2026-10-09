import { NextResponse } from 'next/server';
import { neuralJobMatchingEngine } from '@/lib/engine/NeuralJobMatchingEngine';

export async function GET() {
  try {
    const logs = neuralJobMatchingEngine.getFeedbackLogs();
    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.candidate_id || !body.job_id || !body.interaction_type) {
      return NextResponse.json(
        { success: false, error: 'candidate_id, job_id, and interaction_type are required' },
        { status: 400 }
      );
    }

    const saved = neuralJobMatchingEngine.submitFeedback(body);
    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
