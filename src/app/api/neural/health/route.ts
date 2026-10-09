import { NextResponse } from 'next/server';
import { neuralJobMatchingEngine } from '@/lib/engine/NeuralJobMatchingEngine';

export async function GET() {
  try {
    const status = await neuralJobMatchingEngine.checkHealth();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Error in /api/neural/health:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to check neural engine health' },
      { status: 500 }
    );
  }
}
