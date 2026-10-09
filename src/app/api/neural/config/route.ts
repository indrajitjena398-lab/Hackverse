import { NextResponse } from 'next/server';
import { neuralJobMatchingEngine } from '@/lib/engine/NeuralJobMatchingEngine';
import { NeuralEngineConfig } from '@/lib/types/neuralMatcher';

export async function GET() {
  try {
    const config = neuralJobMatchingEngine.getConfig();
    return NextResponse.json({
      success: true,
      data: config,
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
    const body = (await request.json()) as Partial<NeuralEngineConfig>;
    const updated = neuralJobMatchingEngine.updateConfig(body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
