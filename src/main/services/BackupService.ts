import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';
import { MCPServers } from '../../shared/types';

export class BackupService {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(app.getPath('userData'), 'backups');
  }

  async ensureBackupDir(): Promise<void> {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createBackup(appName: string, config: MCPServers): Promise<boolean> {
    try {
      await this.ensureBackupDir();
      const backupPath = path.join(this.backupDir, `${appName}.json`);
      const backupData = {
        appName,
        config,
        timestamp: Date.now(),
      };
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Failed to create backup for ${appName}:`, error);
      return false;
    }
  }

  async getBackup(appName: string): Promise<MCPServers | null> {
    try {
      const backupPath = path.join(this.backupDir, `${appName}.json`);
      const data = await fs.readFile(backupPath, 'utf-8');
      const backupData = JSON.parse(data);
      return backupData.config;
    } catch (error) {
      console.error(`Failed to read backup for ${appName}:`, error);
      return null;
    }
  }

  async hasBackup(appName: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.backupDir, `${appName}.json`);
      await fs.access(backupPath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteBackup(appName: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.backupDir, `${appName}.json`);
      await fs.unlink(backupPath);
      return true;
    } catch (error) {
      console.error(`Failed to delete backup for ${appName}:`, error);
      return false;
    }
  }
}
