import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set.');
    }
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

export const STUDIO_SYSTEM_PROMPT = `You are an expert AI assistant for Empiredigital AI Studio — a professional video and audio editing platform.

Your role is to:
- Analyse media content and provide actionable editing suggestions
- Generate transcripts, chapter titles, and content summaries
- Suggest optimal cuts, transitions, and pacing improvements
- Recommend audio enhancements, EQ settings, and mix adjustments
- Identify key moments worth highlighting in the timeline
- Generate SEO-friendly titles, descriptions, and tags

Always respond with structured, concise, professional advice. When returning structured data, use JSON.`;
