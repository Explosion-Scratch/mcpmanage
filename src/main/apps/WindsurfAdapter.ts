import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VSCodeAdapter } from './VSCodeAdapter';

export class WindsurfAdapter extends VSCodeAdapter {
  name = 'Windsurf';
  icon = 'https://codeium.com/favicon.ico';
  color = '#09B6A2';
  
  getPath(): string {
    return path.join(os.homedir(), 'Library/Application Support/Windsurf/mcp_server_config.json');
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Windsurf.app';
    return fs.existsSync(appPath);
  }
}
