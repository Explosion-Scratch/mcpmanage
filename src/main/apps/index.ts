import { AppAdapter } from './AppAdapter';
import { ClaudeAdapter } from './ClaudeAdapter';
import { ClaudeCodeAdapter } from './ClaudeCodeAdapter';
import { MistralVibeAdapter } from './MistralVibeAdapter';
import { ZedAdapter } from './ZedAdapter';
import { CursorAdapter } from './CursorAdapter';
import { VSCodeAdapter } from './VSCodeAdapter';
import { WindsurfAdapter } from './WindsurfAdapter';
import { GeminiAdapter } from './GeminiAdapter';
import { QwenAdapter } from './QwenAdapter';
import { OpencodeAdapter } from './OpencodeAdapter';
import { KiloCodeAdapter } from './KiloCodeAdapter';
import { ClineAdapter } from './ClineAdapter';
import { AntigravityAdapter } from './AntigravityAdapter';
import { CustomAppAdapter } from './CustomAppAdapter';
import { CustomAppStore } from '../services/CustomAppStore';

export const APP_ADAPTERS: AppAdapter[] = [
  new ClaudeAdapter(),
  new ClaudeCodeAdapter(),
  new MistralVibeAdapter(),
  new ZedAdapter(),
  new CursorAdapter(),
  new VSCodeAdapter(),
  new WindsurfAdapter(),
  new GeminiAdapter(),
  new QwenAdapter(),
  new OpencodeAdapter(),
  new KiloCodeAdapter(),
  new ClineAdapter(),
  new AntigravityAdapter(),
];

let customAppStore: CustomAppStore | null = null;

export function initCustomAppStore(store: CustomAppStore): void {
  customAppStore = store;
}

export async function getAvailableAdapters(): Promise<AppAdapter[]> {
  const available: AppAdapter[] = [];
  
  for (const adapter of APP_ADAPTERS) {
    const exists = await adapter.configExists();
    console.log(`[Detection] ${adapter.name}: ${exists ? '✓' : '✗'} (${adapter.getPath()})`);
    if (exists) {
      available.push(adapter);
    }
  }
  
  if (customAppStore) {
    const customApps = await customAppStore.getAllApps();
    for (const customApp of customApps) {
      const adapter = new CustomAppAdapter(customApp);
      console.log(`[Detection] ${adapter.name} (custom): ✓ (${adapter.getPath()})`);
      available.push(adapter);
    }
  }
  
  console.log(`[Detection] Total apps detected: ${available.length}/${APP_ADAPTERS.length} built-in`);
  return available;
}

export { AppAdapter } from './AppAdapter';
export { CustomAppAdapter } from './CustomAppAdapter';
