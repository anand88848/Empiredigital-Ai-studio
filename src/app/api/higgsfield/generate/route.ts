import { NextRequest, NextResponse } from 'next/server';
import {
  createTextToVideo,
  createImageToVideo,
  applyVideoEffect,
} from '@/lib/higgsfield';

interface GenerateBody {
  mode: 'text-to-video' | 'image-to-video' | 'effect';
  prompt?: string;
  negative_prompt?: string;
  image_url?: string;
  video_url?: string;
  effect?: string;
  effect_strength?: number;
  duration?: number;
  width?: number;
  height?: number;
  seed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateBody;

    if (body.mode === 'text-to-video') {
      if (!body.prompt) {
        return NextResponse.json({ error: 'prompt is required for text-to-video' }, { status: 400 });
      }
      const result = await createTextToVideo({
        prompt: body.prompt,
        negative_prompt: body.negative_prompt,
        duration: body.duration,
        width: body.width,
        height: body.height,
        seed: body.seed,
      });
      return NextResponse.json(result);
    }

    if (body.mode === 'image-to-video') {
      if (!body.image_url) {
        return NextResponse.json({ error: 'image_url is required for image-to-video' }, { status: 400 });
      }
      const result = await createImageToVideo({
        image_url: body.image_url,
        prompt: body.prompt,
        duration: body.duration,
        seed: body.seed,
      });
      return NextResponse.json(result);
    }

    if (body.mode === 'effect') {
      if (!body.video_url || !body.effect) {
        return NextResponse.json({ error: 'video_url and effect are required' }, { status: 400 });
      }
      const result = await applyVideoEffect({
        video_url: body.video_url,
        effect: body.effect,
        strength: body.effect_strength,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
