import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

type IdParams = { id: string };

export async function POST(request: Request, context: { params: Promise<IdParams> }) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }
    await workshopService.setNext(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /admin/workshops/[id]/set-next error:', error);
    return NextResponse.json(
      { error: 'Failed to set next workshop' },
      { status: 500 }
    );
  }
}

