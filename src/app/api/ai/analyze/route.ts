import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, STUDIO_SYSTEM_PROMPT } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      prompt?: string;
      fileName?: string;
      duration?: number;
      type?: 'video' | 'audio';
      context?: string;
    };

    const client = getAnthropicClient();

    let userPrompt = body.prompt ?? '';

    if (!userPrompt && body.fileName) {
      const mediaType = body.type ?? 'media';
      const dur = body.duration
        ? `${Math.floor(body.duration / 60)}m ${Math.floor(body.duration % 60)}s`
        : 'unknown length';

      userPrompt = `Analyse this ${mediaType} file for editing:
- File name: ${body.fileName}
- Duration: ${dur}

Please provide:
1. A brief content summary based on the filename
2. Suggested edit points and pacing tips
3. ${body.type === 'audio' ? 'EQ and mixing recommendations' : 'Colour grade and transition recommendations'}
4. 5–8 relevant content tags
5. A suggested title and short description for export/publishing

Be specific and professional.`;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: STUDIO_SYSTEM_PROMPT,
      messages: [
        ...(body.context ? [{ role: 'user' as const, content: `Context: ${body.context}` }, { role: 'assistant' as const, content: 'Understood. How can I help?' }] : []),
        { role: 'user', content: userPrompt },
      ],
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
