import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, STUDIO_SYSTEM_PROMPT } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
    const { fileName, duration, genre, targetPlatform } = await req.json() as {
      fileName?: string;
      duration?: number;
      genre?: string;
      targetPlatform?: string;
    };

    const client = getAnthropicClient();

    const prompt = `Provide professional audio enhancement recommendations for:
- File: ${fileName ?? 'Unknown'}
- Duration: ${duration ? `${Math.round(duration)}s` : 'Unknown'}
- Genre/Style: ${genre ?? 'Not specified'}
- Target Platform: ${targetPlatform ?? 'General'}

Give specific settings for:
1. EQ (frequency ranges, boost/cut in dB)
2. Compression (threshold, ratio, attack, release)
3. Reverb / spatial effects
4. Stereo width
5. Loudness target (LUFS for platform)
6. Mastering chain order
Be precise with numbers.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
