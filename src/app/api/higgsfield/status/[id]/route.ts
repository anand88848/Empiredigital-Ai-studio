import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/higgsfield';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const job = await getJob(params.id);
    return NextResponse.json(job);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
