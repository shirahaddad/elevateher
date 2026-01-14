import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

type IdParams = { id: string };

export async function PATCH(request: Request, context: { params: Promise<IdParams> }) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    const body = await request.json();
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }

    const updated = await workshopService.update({
      id,
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      content_md: body.content_md,
      start_at: body.start_at,
      location: body.location,
      registration_url: body.registration_url,
      status: body.status,
      hero_image_key: body.hero_image_key,
      resource_password: body.resource_password,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('PATCH /admin/workshops/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update workshop' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<IdParams> }) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }

    await workshopService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /admin/workshops/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workshop' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: { params: Promise<IdParams> }) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }
    const workshop = await workshopService.getById(id);
    return NextResponse.json({ data: workshop });
  } catch (error) {
    console.error('GET /admin/workshops/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshop' },
      { status: 500 }
    );
  }
}

