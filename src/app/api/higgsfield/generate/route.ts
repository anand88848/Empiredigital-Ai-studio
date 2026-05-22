import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/lib/higgsfield';
import type { CreateJobRequest } from '@/lib/higgsfield';

export async function POST(req: NextRequest) {
  try {
    const body: CreateJobRequest = await req.json();

    if (!body.job_set_type) {
      return NextResponse.json({ error: 'job_set_type is required' }, { status: 400 });
    }

    const job = await createJob(body);
    return NextResponse.json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
