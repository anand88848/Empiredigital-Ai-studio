import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, STUDIO_SYSTEM_PROMPT } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
    const { text, fileName } = await req.json() as { text?: string; fileName?: string };

    const client = getAnthropicClient();

    const prompt = text
      ? `Clean up and format this raw transcript for a video/audio editor. Add punctuation, fix grammar, and split into logical paragraphs. Return chapter timestamps if logical breaks are evident.\n\nRaw text:\n${text}`
      : `Generate a placeholder script/transcript template for a media file named "${fileName}". Include 3 sample chapters with timestamps.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: STUDIO_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
