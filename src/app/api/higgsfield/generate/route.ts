import { NextRequest, NextResponse } from 'next/server';
import { createGeneration } from '@/lib/higgsfield';
import type { HiggsfieldGenerateRequest } from '@/types/higgsfield';

export async function POST(req: NextRequest) {
  try {
    const body: HiggsfieldGenerateRequest = await req.json();

    if (!body.effect) {
      return NextResponse.json({ error: 'effect is required' }, { status: 400 });
    }

    const result = await createGeneration(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
