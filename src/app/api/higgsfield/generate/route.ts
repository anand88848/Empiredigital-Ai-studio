import { NextRequest, NextResponse } from 'next/server';
import { submitGeneration, type GenerateVideoInput } from '@/lib/higgsfield';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateVideoInput;

    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const result = await submitGeneration(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
