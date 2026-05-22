import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/higgsfield';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const job = await getJobStatus(params.id);
    return NextResponse.json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
