import { NextRequest, NextResponse } from 'next/server';
import { getHiggsfieldClient } from '@/lib/higgsfield';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageUrl, model = 'dop-standard' } = await req.json() as {
      prompt: string;
      imageUrl: string;
      model?: 'dop-lite' | 'dop-turbo' | 'dop-standard';
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: 'Image URL is required for video generation.' }, { status: 400 });
    }

    const client = getHiggsfieldClient();
    const response = await client.subscribe('/v1/image2video/dop', {
      input: {
        model,
        prompt: prompt.trim(),
        input_images: [{ type: 'image_url', image_url: imageUrl.trim() }],
        enhance_prompt: true,
      },
      withPolling: true,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
