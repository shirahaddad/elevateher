import { NextResponse, NextRequest } from 'next/server';
import { sendWorkshopRegistrationAdminEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { workshopRegistrationSchema } from '@/lib/validation/base';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

const validateWorkshopRegister = createValidationMiddleware({
  schema: workshopRegistrationSchema,
  onError: (result) => {
    return NextResponse.json(
      { success: false, errors: result.errors, message: 'Validation failed' },
      { status: 400 }
    );
  },
});

function formatWorkshopDate(iso?: string): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
  return `${date} at ${time} ET`;
}

export async function POST(request: NextRequest) {
  try {
    const validationResponse = await validateWorkshopRegister(request);
    if (validationResponse) return validationResponse;

    const data = (request as any).validatedData;
    const emailLower = (data.email as string).toLowerCase();

    let workshop: Awaited<ReturnType<typeof workshopService.getWorkshopBySlug>>;
    try {
      workshop = await workshopService.getWorkshopBySlug(data.workshopSlug);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      );
    }

    const workshopId = workshop.id as number;

    const { data: existing } = await supabaseAdmin
      .from('waitlist')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('email', emailLower)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'already_registered',
          message: "You're already registered for this workshop.",
        },
        { status: 409 }
      );
    }

    const { error: dbError } = await supabaseAdmin.from('waitlist').insert([
      {
        name: data.name,
        email: emailLower,
        category: 'workshop-registration',
        workshop_id: workshopId,
        mailing_list: data.mailingList ?? false,
        linkedin: null,
      },
    ]);

    if (dbError) {
      if (dbError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'already_registered',
            message: "You're already registered for this workshop.",
          },
          { status: 409 }
        );
      }
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save registration' },
        { status: 500 }
      );
    }

    if (data.mailingList) {
      const now = new Date().toISOString();
      await supabaseAdmin.from('mailing_list_subscribers').upsert(
        {
          email: emailLower,
          name: data.name,
          status: 'subscribed',
          subscribed_at: now,
          last_source: 'workshop-registration',
        },
        { onConflict: 'email' }
      );
    }

    const workshopDate = formatWorkshopDate(workshop.start_at ?? undefined);
    const resultAdmin = await sendWorkshopRegistrationAdminEmail({
      workshopTitle: workshop.title,
      workshopDate,
      name: data.name,
      email: data.email,
    });

    if (!resultAdmin.success) {
      console.error('Admin email failed:', resultAdmin.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Workshop register error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
