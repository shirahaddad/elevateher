import { NextResponse } from 'next/server';
import { TagService } from '@/lib/api/services/blog/tag.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { TagsResponse } from '@/lib/api/types/blog';

export async function GET() {
  try {
    const tagService = TagService.getInstance();
    const tags = await tagService.getTags();

    const response: TagsResponse = {
      data: tags,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
} 