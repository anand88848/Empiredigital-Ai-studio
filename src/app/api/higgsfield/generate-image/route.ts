import { NextRequest, NextResponse } from 'next/server';
import { getHiggsfieldClient } from '@/lib/higgsfield';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = '1536x1536', quality = '1080p' } = await req.json() as {
      prompt: string;
      size?: string;
      quality?: '720p' | '1080p';
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const client = getHiggsfieldClient();
    const response = await client.subscribe('/v1/text2image/soul', {
      input: {
        prompt: prompt.trim(),
        width_and_height: size,
        quality,
        batch_size: 1,
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
