import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const id = params.id;
    const body = await request.json();
    if (!id) {
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

export async function DELETE(request: Request, { params }: Params) {
  try {
    const id = params.id;
    if (!id) {
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

