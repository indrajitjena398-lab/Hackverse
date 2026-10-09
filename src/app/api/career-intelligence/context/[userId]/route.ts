import { NextRequest, NextResponse } from 'next/server';
import { crossModuleCoherenceEngine } from '@/lib/engine/CrossModuleCoherenceEngine';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = decodeURIComponent(params.userId);
    const searchParams = req.nextUrl.searchParams;
    const module = searchParams.get('module') || 'general';

    const context = crossModuleCoherenceEngine.getSharedModuleContext(userId, module);

    return NextResponse.json({
      success: true,
      module,
      data: context,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve shared module context' },
      { status: 500 }
    );
  }
}
