import { NextResponse } from 'next/server';
import { sendLearnMoreEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
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

    // Send email
    console.log('Attempting to send email...');
    const result = await sendLearnMoreEmail(data);

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