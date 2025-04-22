import { NextResponse } from 'next/server';
import { sendQuestionnaireEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received questionnaire data:', JSON.stringify(data, null, 2));

    // Validate required fields
    const missingFields = [];
    if (!data.client_name) missingFields.push('client_name');
    if (!data.email) missingFields.push('email');
    if (!data.goals) missingFields.push('goals');
    if (!data.skills) missingFields.push('skills');
    if (!data.timeCommitment) missingFields.push('timeCommitment');

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('questionnaire_submissions')
      .insert([
        {
          client_name: data.client_name,
          email: data.email,
          goals: data.goals,
          skills: data.skills,
          other_skill: data.otherSkill,
          time_commitment: data.timeCommitment,
          linkedin: data.linkedin,
          additional_info: data.additionalInfo,
          mailing_list: data.mailingList,
          source: data.source,
        },
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission to database' },
        { status: 500 }
      );
    }

    // Send email
    console.log('Attempting to send email...');
    const result = await sendQuestionnaireEmail(data);

    if (!result.success) {
      console.error('Email sending failed:', result.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error
        },
        { status: 500 }
      );
    }

    console.log('Questionnaire processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing questionnaire:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error details:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 