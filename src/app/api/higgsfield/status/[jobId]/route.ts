import { NextRequest, NextResponse } from 'next/server';
import { getGeneration } from '@/lib/higgsfield';

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const result = await getGeneration(params.jobId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
