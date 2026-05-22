import { NextRequest, NextResponse } from 'next/server';
import {
  generateTextToVideo,
  generateImageToVideo,
  generateImage,
} from '@/lib/higgsfield';

interface GenerateBody {
  mode: 'text-to-video' | 'image-to-video' | 'text-to-image';
  prompt?: string;
  image_url?: string;
  model?: 'lite' | 'turbo' | 'standard';
  motion_id?: string;
  style_id?: string;
  duration?: number;
  seed?: number;
  width_and_height?: '512x512' | '768x512' | '512x768' | '1024x768' | '768x1024';
  quality?: 'normal' | 'high';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateBody;

    if (body.mode === 'text-to-video') {
      if (!body.prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
      const result = await generateTextToVideo({
        prompt: body.prompt,
        model: body.model,
        motion_id: body.motion_id,
        duration: body.duration,
        seed: body.seed,
      });
      return NextResponse.json(result);
    }

    if (body.mode === 'image-to-video') {
      if (!body.image_url) return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
      const result = await generateImageToVideo({
        image_url: body.image_url,
        prompt: body.prompt,
        model: body.model,
        motion_id: body.motion_id,
        seed: body.seed,
      });
      return NextResponse.json(result);
    }

    if (body.mode === 'text-to-image') {
      if (!body.prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
      const result = await generateImage({
        prompt: body.prompt,
        style_id: body.style_id,
        width_and_height: body.width_and_height,
        quality: body.quality,
        seed: body.seed,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
