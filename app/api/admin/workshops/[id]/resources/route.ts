import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

type IdParams = { id: string };

export async function POST(request: Request, context: { params: Promise<IdParams> }) {
  try {
    const { id: idParam } = await context.params;
    const workshopId = Number(idParam);
    if (!workshopId || Number.isNaN(workshopId)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }
    const body = await request.json();
    const kind = (body?.kind as 'FILE' | 'URL' | 'TEXT') || 'FILE';
    if (!body?.name) {
      return NextResponse.json({ error: 'Missing resource name' }, { status: 400 });
    }
    if (kind === 'FILE' && !body?.s3_key) {
      return NextResponse.json({ error: 'Missing s3_key for FILE resource' }, { status: 400 });
    }
    if ((kind === 'URL' || kind === 'TEXT') && !body?.value) {
      return NextResponse.json({ error: 'Missing value for URL/TEXT resource' }, { status: 400 });
    }

    const resource = await workshopService.addResource(workshopId, {
      workshop_id: workshopId,
      name: body.name,
      kind,
      s3_key: body.s3_key,
      value: body.value,
      mime_type: body.mime_type,
    });

    return NextResponse.json({ data: resource });
  } catch (error) {
    console.error('POST /admin/workshops/[id]/resources error:', error);
    return NextResponse.json(
      { error: 'Failed to add resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, _context: { params: Promise<IdParams> }) {
  try {
    const body = await request.json();
    const resourceIdParam = body?.resourceId;
    const resourceId = Number(resourceIdParam);
    if (!resourceId || Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Missing resourceId' }, { status: 400 });
    }
    await workshopService.removeResource(resourceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /admin/workshops/[id]/resources error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}

