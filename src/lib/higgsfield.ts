import { createHiggsfieldClient } from '@higgsfield/client/v2';

let _client: ReturnType<typeof createHiggsfieldClient> | null = null;

export function getHiggsfieldClient() {
  if (!_client) {
    if (!process.env.HIGGSFIELD_CREDENTIALS) {
      throw new Error('HIGGSFIELD_CREDENTIALS environment variable is not set.');
    }
    _client = createHiggsfieldClient({
      credentials: process.env.HIGGSFIELD_CREDENTIALS,
      pollInterval: 3000,
      maxPollTime: 300_000,
    });
  }
  return _client;
}

export const SOUL_SIZES: Record<string, string> = {
  'Square 1:1':      '1536x1536',
  'Landscape 16:9':  '2048x1152',
  'Portrait 9:16':   '1152x2048',
  'Landscape 4:3':   '2048x1536',
  'Portrait 3:4':    '1536x2048',
};
