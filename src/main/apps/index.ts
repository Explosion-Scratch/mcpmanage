import { AppAdapter } from './AppAdapter';
import { ClaudeAdapter } from './ClaudeAdapter';
import { ZedAdapter } from './ZedAdapter';
import { CursorAdapter } from './CursorAdapter';
import { VSCodeAdapter } from './VSCodeAdapter';
import { WindsurfAdapter } from './WindsurfAdapter';

export const APP_ADAPTERS: AppAdapter[] = [
  new ClaudeAdapter(),
  new ZedAdapter(),
  new CursorAdapter(),
  new VSCodeAdapter(),
  new WindsurfAdapter(),
];

export async function getAvailableAdapters(): Promise<AppAdapter[]> {
  const available: AppAdapter[] = [];
  
  for (const adapter of APP_ADAPTERS) {
    const exists = await adapter.configExists();
    console.log(`[Detection] ${adapter.name}: ${exists ? '✓' : '✗'} (${adapter.getPath()})`);
    if (exists) {
      available.push(adapter);
    }
  }
  
  console.log(`[Detection] Total apps detected: ${available.length}/${APP_ADAPTERS.length}`);
  return available;
}

export { AppAdapter } from './AppAdapter';
