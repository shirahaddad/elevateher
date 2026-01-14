import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as 'NEXT' | 'FUTURE' | 'PAST' | null;

    const result = await workshopService.listAll({
      page,
      limit,
      status: status || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /admin/workshops error:', error);
    return NextResponse.json(
      { error: 'Failed to list workshops' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const workshop = await workshopService.create({
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      content_md: body.content_md,
      start_at: body.start_at,
      location: body.location,
      registration_url: body.registration_url,
      status: body.status,
      hero_image_key: body.hero_image_key,
      resource_password: body.resource_password, // stored later when gating enabled
    });

    return NextResponse.json({ data: workshop });
  } catch (error) {
    console.error('POST /admin/workshops error:', error);
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    );
  }
}

