import { NextRequest, NextResponse } from 'next/server';
import { placementInterviewStore } from '@/lib/engine/PlacementInterviewStore';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const list = placementInterviewStore.getAllInterviews();
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch placement interviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.candidateName || !body.companyName || !body.roleTitle) {
      return NextResponse.json(
        { success: false, error: 'Candidate name, company, and role are required' },
        { status: 400 }
      );
    }

    const newInterview = {
      id: body.id || `int-user-${Date.now()}`,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      institutionName: body.institutionName || 'Parala Maharaja Engineering College (PMEC)',
      department: body.department || 'Computer Science & Engineering',
      cgpa: body.cgpa || '8.8',
      companyName: body.companyName,
      roleTitle: body.roleTitle,
      packageCtc: body.packageCtc || '18.0 LPA',
      placementYear: body.placementYear || 2026,
      videoUrl: body.videoUrl,
      isUserRecorded: true,
      thumbnailUrl: body.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      durationSeconds: body.durationSeconds || 300,
      transcript: body.transcript || [],
      placementSuccessFactors: body.placementSuccessFactors || {
        whyTheyGotPlaced: 'Articulated strong technical fundamentals and structured communication.',
        keyCompetencies: ['Full-Stack Engineering', 'System Design', 'Communication'],
        breakdownScores: {
          technicalProwess: 90,
          systemDesign: 88,
          communication: 92,
          culturalFit: 94,
        },
        answerHighlights: [],
        alumniAdvice: 'Focus on explaining trade-offs and writing clean code.',
      },
      interviewerNotes: body.interviewerNotes || 'Candidate demonstrated verified engineering competency.',
      viewsCount: 1,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    placementInterviewStore.addRecordedInterview(newInterview);

    // Save to Supabase if configured
    try {
      const supabase = createServerSupabaseClient();
      if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) {
        await supabase.from('placement_video_interviews').insert({
          candidate_name: newInterview.candidateName,
          candidate_email: newInterview.candidateEmail,
          institution_name: newInterview.institutionName,
          department: newInterview.department,
          cgpa: newInterview.cgpa,
          company_name: newInterview.companyName,
          role_title: newInterview.roleTitle,
          package_ctc: newInterview.packageCtc,
          placement_year: newInterview.placementYear,
          video_url: newInterview.videoUrl,
          is_user_recorded: true,
          thumbnail_url: newInterview.thumbnailUrl,
          duration_seconds: newInterview.durationSeconds,
          transcript: newInterview.transcript,
          placement_success_factors: newInterview.placementSuccessFactors,
          interviewer_notes: newInterview.interviewerNotes,
        });
      }
    } catch (dbErr) {
      console.warn('Supabase placement interview sync bypassed:', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: newInterview,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save recorded interview' },
      { status: 500 }
    );
  }
}
