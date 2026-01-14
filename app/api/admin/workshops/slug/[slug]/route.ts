import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

type SlugParams = { slug: string };

export async function GET(request: Request, context: { params: Promise<SlugParams> }) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Missing workshop slug' }, { status: 400 });
    }
    const workshop = await workshopService.getWorkshopBySlug(slug);
    return NextResponse.json({ data: workshop });
  } catch (error) {
    console.error('GET /admin/workshops/slug/[slug] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshop by slug' },
      { status: 500 }
    );
  }
}

