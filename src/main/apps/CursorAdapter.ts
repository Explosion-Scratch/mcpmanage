import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VSCodeAdapter } from './VSCodeAdapter';

export class CursorAdapter extends VSCodeAdapter {
  name = 'Cursor';
  icon = 'https://www.cursor.com/favicon.ico';
  color = '#000000';
  
  getPath(): string {
    return path.join(os.homedir(), 'Library/Application Support/Cursor/User/globalStorage/mcp.json');
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Cursor.app';
    return fs.existsSync(appPath);
  }
}
