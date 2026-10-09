import { NextResponse } from 'next/server';
import { neuralJobMatchingEngine } from '@/lib/engine/NeuralJobMatchingEngine';
import { NeuralMatchRequest } from '@/lib/types/neuralMatcher';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NeuralMatchRequest;
    if (!body || !body.candidate || !body.job) {
      return NextResponse.json(
        { success: false, error: 'Both candidate and job objects are required.' },
        { status: 400 }
      );
    }

    const result = await neuralJobMatchingEngine.match(body);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in /api/neural/match:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to compute neural match' },
      { status: 500 }
    );
  }
}
