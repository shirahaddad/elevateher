import { NextResponse } from 'next/server';
import { sendLearnMoreEmail } from '@/lib/email';
import { sendLearnMoreEmailProspect } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';

interface LearnMoreData {
  name: string;
  email: string;
  mailingList: boolean;
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as LearnMoreData;
    console.log('Received learn-more data:', JSON.stringify(data, null, 2));

    // Validate required fields
    const missingFields = [];
    if (!data.name) missingFields.push('name');
    if (!data.email) missingFields.push('email');

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('learn_more_submissions')
      .insert([
        {
          name: data.name,
          email: data.email,
          mailing_list: data.mailingList,
        },
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission to database' },
        { status: 500 }
      );
    }

    // Send email to admin
    console.log('Attempting to send email to admin...');
    const resultAdmin = await sendLearnMoreEmail(data);

    if (!resultAdmin.success) {
      console.error('Email sending to admin failed:', resultAdmin.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email to admin',
          details: resultAdmin.error
        },
        { status: 500 }
      );
    }

    // Send email to prospect
    console.log('Attempting to send welcome email to prospect...');
    const resultWelcome = await sendLearnMoreEmailProspect({
      email: data.email,
      name: data.name
    });

    if (!resultWelcome.success) {
      console.error('Email sending to prospect failed:', resultWelcome.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email to prospect',
          details: resultWelcome.error
        },
        { status: 500 }
      );
    }

    console.log('Form processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing learn more data:', error);
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