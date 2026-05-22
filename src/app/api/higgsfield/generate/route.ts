import { NextRequest, NextResponse } from 'next/server';
import { createGeneration } from '@/lib/higgsfield';
import type { HiggsfieldGenerationRequest } from '@/types/higgsfield';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as HiggsfieldGenerationRequest;

    if (!body.model) {
      return NextResponse.json({ error: 'model is required' }, { status: 400 });
    }
    if (!body.prompt && !body.image_url) {
      return NextResponse.json({ error: 'prompt or image_url is required' }, { status: 400 });
    }

    const generation = await createGeneration(body);
    return NextResponse.json(generation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
