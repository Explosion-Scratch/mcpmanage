import { execSync } from 'child_process';

let cachedRunner: string | null = null;

/**
 * Determines the preferred package runner (bunx or npx).
 * Caches the result to avoid repeated lookups.
 * @returns 'bunx' if available, otherwise 'npx'
 */
export function getPackageRunner(): string {
  if (cachedRunner !== null) {
    return cachedRunner;
  }
  
  try {
    execSync('which bunx', { stdio: 'ignore' });
    cachedRunner = 'bunx';
  } catch {
    cachedRunner = 'npx';
  }
  
  return cachedRunner;
}

/**
 * Creates a command configuration for mcp-remote to connect to a remote MCP server.
 * @param url The URL of the remote MCP server (SSE or HTTP endpoint)
 * @param headers Optional headers to send with the request (e.g., for authentication)
 * @returns An object with command and args for the mcp-remote bridge
 */
export function createMcpRemoteConfig(
  url: string,
  headers?: Record<string, string>
): { command: string; args: string[] } {
  const runner = getPackageRunner();
  const args: string[] = ['-y', 'mcp-remote', url];
  
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      args.push('--header', `${key}: ${value}`);
    }
  }
  
  return {
    command: runner,
    args,
  };
}
