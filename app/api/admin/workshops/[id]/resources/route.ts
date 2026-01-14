import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

interface Params {
  params: { id: string };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const workshopId = params.id;
    if (!workshopId) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }
    const body = await request.json();
    if (!body?.name || !body?.s3_key) {
      return NextResponse.json(
        { error: 'Missing resource name or s3_key' },
        { status: 400 }
      );
    }

    const resource = await workshopService.addResource(workshopId, {
      workshop_id: workshopId,
      name: body.name,
      s3_key: body.s3_key,
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

export async function DELETE(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const resourceId = body?.resourceId as string | undefined;
    if (!resourceId) {
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

