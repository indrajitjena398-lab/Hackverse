import { NextRequest, NextResponse } from 'next/server';
import { feedbackAnalysisEngine } from '@/lib/engine/FeedbackAnalysisEngine';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let records = userId 
      ? feedbackAnalysisEngine.getUserFeedback(userId)
      : feedbackAnalysisEngine.getAnalyticsSummary().recentFeedbacks;

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch feedback records' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const feature_type = body.feature_type || body.featureType;
    if (!feature_type) {
      return NextResponse.json(
        { success: false, error: 'Feature type is required' },
        { status: 400 }
      );
    }

    const normalizedPayload = {
      feedback_id: body.feedback_id || body.feedbackId,
      user_id: body.user_id || body.userId,
      feature_type,
      feature_id: body.feature_id || body.featureId,
      ai_output_id: body.ai_output_id || body.aiOutputId,
      rating: body.rating,
      feedback_type: body.feedback_type || body.feedbackType,
      reason: Array.isArray(body.reason) ? body.reason : (body.reason ? [body.reason] : []),
      comment: body.comment,
      sentiment: body.sentiment,
      correction_data: body.correction_data || body.correctionData,
      career_goal: body.career_goal || body.careerGoal,
      ai_confidence_score: body.ai_confidence_score || body.aiConfidenceScore,
    };

    // 1. Process feedback through Feedback Analysis Engine (Section 20 & 21)
    const analyzedRecord = feedbackAnalysisEngine.recordFeedback(normalizedPayload);
    const updatedPreferences = feedbackAnalysisEngine.getUserPreferences(analyzedRecord.user_id);

    // 2. Persist to Supabase PostgreSQL if database configured
    try {
      const supabase = createServerSupabaseClient();
      if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) {
        await supabase.from('feedback').insert({
          user_id: analyzedRecord.user_id,
          feature_type: analyzedRecord.feature_type,
          feature_id: analyzedRecord.feature_id,
          ai_output_id: analyzedRecord.ai_output_id,
          rating: analyzedRecord.rating,
          feedback_type: analyzedRecord.feedback_type,
          reason: analyzedRecord.reason,
          comment: analyzedRecord.comment,
          sentiment: analyzedRecord.sentiment,
          correction_data: analyzedRecord.correction_data,
          career_goal: analyzedRecord.career_goal,
          ai_confidence_score: analyzedRecord.ai_confidence_score,
          action_taken: analyzedRecord.action_taken,
        });

        // Upsert user career preferences
        await supabase.from('user_career_preferences').upsert({
          user_id: analyzedRecord.user_id,
          preferred_roles: updatedPreferences.preferred_roles,
          disliked_roles: updatedPreferences.disliked_roles,
          corrected_skills: updatedPreferences.corrected_skills,
          feedback_count: updatedPreferences.feedback_count,
          feature_quality_scores: updatedPreferences.feature_quality_scores,
          last_feedback_at: updatedPreferences.last_updated,
        }, { onConflict: 'user_id' });
      }
    } catch (dbErr) {
      console.warn('Supabase feedback sync bypassed (local engine handled):', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        record: analyzedRecord,
        preferences: updatedPreferences,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
