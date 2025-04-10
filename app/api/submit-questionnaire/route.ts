import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Save to database
    const { data, error } = await supabase
      .from('questionnaire_submissions')
      .insert([
        {
          email: formData.email,
          goals: formData.goals,
          skills: formData.skills,
          other_skill: formData.otherSkill,
          time_commitment: formData.timeCommitment,
          linkedin: formData.linkedin,
          additional_info: formData.additionalInfo,
          mailing_list: formData.mailingList,
        },
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
} 