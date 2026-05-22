import { NextRequest, NextResponse } from 'next/server';
import { getHiggsfieldClient } from '@/lib/higgsfield';

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const client = getHiggsfieldClient();
    // Use the underlying axios client to hit the status endpoint directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosClient = (client as any).client;
    const res = await axiosClient.get(`/v1/jobs/${params.jobId}`);
    const job = res.data;
    return NextResponse.json({
      id: job.id,
      status: job.status ?? 'pending',
      video_url: job.result_url ?? undefined,
      image_url: job.result_url ?? undefined,
      error: job.error ?? undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
