import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
    const { idea, type } = await req.json() as { idea: string; type: 'image' | 'video' };

    if (!idea?.trim()) {
      return NextResponse.json({ error: 'Idea is required.' }, { status: 400 });
    }

    const client = getAnthropicClient();

    const systemPrompt = type === 'image'
      ? `You are an expert at writing prompts for Higgsfield Soul AI image generation.
         Convert the user's simple idea into a rich, detailed, cinematic image generation prompt.
         Include: subject details, lighting, mood, camera style, color palette, quality descriptors.
         Return ONLY the prompt text — no explanation, no quotes, no extra text.`
      : `You are an expert at writing motion prompts for Higgsfield DoP AI video generation.
         Convert the user's simple idea into a detailed cinematic camera motion prompt.
         Include: camera movement (pan, dolly, zoom), speed, depth of field, lighting changes, mood.
         Return ONLY the prompt text — no explanation, no quotes, no extra text.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: idea.trim() }],
    });

    const prompt = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    return NextResponse.json({ prompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
