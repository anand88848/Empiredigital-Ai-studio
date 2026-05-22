import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';

const SYSTEM = `You are a cinematic video prompt engineer. Rewrite the user's
idea into a single vivid prompt for an AI video generator (Higgsfield).
Include: subject, action, camera movement, lens/framing, lighting, mood,
colour palette, environment. Keep it under 80 words. Output ONLY the prompt
text — no preface, no bullet points, no quotes.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    const refined = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim();

    return NextResponse.json({ refined });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
