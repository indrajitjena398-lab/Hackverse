import { NextRequest, NextResponse } from 'next/server';
import { placementDispatchStore } from '@/lib/engine/PlacementDispatchStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const dispatches = placementDispatchStore.getAllDispatches();
    return NextResponse.json({
      success: true,
      data: dispatches,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch company dispatches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, roleTitle, packageCtc, institutionName, requiredSkills, matchedStudents, notes } = body;

    if (!companyName || !roleTitle || !matchedStudents || !Array.isArray(matchedStudents)) {
      return NextResponse.json(
        { success: false, error: 'companyName, roleTitle, and matchedStudents array are required' },
        { status: 400 }
      );
    }

    const created = placementDispatchStore.createCompanyDispatch({
      companyName,
      roleTitle,
      packageCtc: packageCtc || '20.0 LPA',
      institutionName: institutionName || 'Parala Maharaja Engineering College (PMEC)',
      requiredSkills: requiredSkills || [],
      matchedStudents,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create company dispatch' },
      { status: 500 }
    );
  }
}
