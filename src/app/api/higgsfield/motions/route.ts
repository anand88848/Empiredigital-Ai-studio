import { NextResponse } from 'next/server';
import { getMotions, getStyles } from '@/lib/higgsfield';

export async function GET() {
  try {
    const [motions, styles] = await Promise.all([getMotions(), getStyles()]);
    return NextResponse.json({ motions, styles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
