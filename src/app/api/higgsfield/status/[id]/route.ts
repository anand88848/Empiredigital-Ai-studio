import { NextRequest, NextResponse } from 'next/server';
import { getGeneration } from '@/lib/higgsfield';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const generation = await getGeneration(params.id);
    return NextResponse.json(generation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
