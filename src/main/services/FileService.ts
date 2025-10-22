import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseJSON, stringifyJSON } from '../utils/jsonParser';

export class FileService {
  static expandPath(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return path.join(os.homedir(), filePath.slice(2));
    }
    return filePath;
  }

  static async readJSON(filePath: string): Promise<any> {
    const expandedPath = this.expandPath(filePath);
    
    try {
      if (!fs.existsSync(expandedPath)) {
        return null;
      }
      
      const content = await fs.promises.readFile(expandedPath, 'utf-8');
      return parseJSON(content);
    } catch (error) {
      console.error(`Error reading JSON from ${expandedPath}:`, error);
      return null;
    }
  }

  static async writeJSON(filePath: string, data: any): Promise<boolean> {
    const expandedPath = this.expandPath(filePath);
    
    try {
      const dir = path.dirname(expandedPath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      
      await fs.promises.writeFile(
        expandedPath,
        stringifyJSON(data, 2),
        'utf-8'
      );
      return true;
    } catch (error) {
      console.error(`Error writing JSON to ${expandedPath}:`, error);
      return false;
    }
  }

  static async ensureFile(filePath: string, defaultContent: any = {}): Promise<void> {
    const expandedPath = this.expandPath(filePath);
    
    if (!fs.existsSync(expandedPath)) {
      await this.writeJSON(filePath, defaultContent);
    }
  }
}

