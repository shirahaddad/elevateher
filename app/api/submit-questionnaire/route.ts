import { NextResponse, NextRequest } from 'next/server';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { questionnaireFormSchema } from '@/lib/validation/base';
import { supabaseAdmin } from '@/lib/supabase';

// Create validation middleware
const validateQuestionnaire = createValidationMiddleware({
  schema: questionnaireFormSchema,
  onError: (result) => {
    return NextResponse.json(
      { 
        success: false,
        errors: result.errors,
        message: 'Validation failed'
      },
      { status: 400 }
    );
  },
});

export async function POST(request: NextRequest) {
  try {
    // Validate request data
    const validationResponse = await validateQuestionnaire(request);
    if (validationResponse) return validationResponse;

    // Get validated data from request
    const data = (request as any).validatedData;
    console.log('Received questionnaire data:', JSON.stringify(data, null, 2));

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

    // TODO: Send email notifications
    // We can implement this later if needed

    console.log('Form processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing questionnaire data:', error);
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