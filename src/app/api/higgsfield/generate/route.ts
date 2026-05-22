import { NextRequest, NextResponse } from 'next/server';
import {
  createImageToVideo,
  createTextToImage,
  createSoulImage,
} from '@/lib/higgsfield';
import type { HiggsfieldEndpoint } from '@/types/higgsfield';

interface GenerateBody {
  endpoint: HiggsfieldEndpoint;
  prompt?: string;
  image_url?: string;
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateBody;
    const { endpoint, prompt, image_url, aspect_ratio = '16:9' } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });
    }

    let job;

    if (endpoint === 'image2video') {
      if (!image_url) return NextResponse.json({ error: 'image_url is required for image2video' }, { status: 400 });
      job = await createImageToVideo({
        model: 'dop-turbo',
        prompt: prompt ?? '',
        input_images: [{ type: 'image_url', image_url }],
      });
    } else if (endpoint === 'text2image') {
      if (!prompt) return NextResponse.json({ error: 'prompt is required for text2image' }, { status: 400 });
      job = await createTextToImage({ prompt, aspect_ratio });
    } else if (endpoint === 'soul') {
      if (!prompt) return NextResponse.json({ error: 'prompt is required for soul' }, { status: 400 });
      job = await createSoulImage({ prompt, aspect_ratio });
    } else {
      return NextResponse.json({ error: `Unknown endpoint: ${endpoint}` }, { status: 400 });
    }

    return NextResponse.json(job);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
