import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { CustomAppConfig } from '../../shared/types';

export class CustomAppStore {
  private storePath: string;
  private apps: CustomAppConfig[] = [];

  constructor() {
    const userDataPath = app.getPath('userData');
    this.storePath = path.join(userDataPath, 'custom-apps.json');
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.storePath)) {
        const data = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'));
        this.apps = data.apps || [];
      }
    } catch (error) {
      console.error('Error loading custom apps:', error);
      this.apps = [];
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storePath, JSON.stringify({ apps: this.apps }, null, 2));
    } catch (error) {
      console.error('Error saving custom apps:', error);
    }
  }

  async getAllApps(): Promise<CustomAppConfig[]> {
    return this.apps;
  }

  async addApp(app: CustomAppConfig): Promise<boolean> {
    const existingIndex = this.apps.findIndex(a => a.id === app.id);
    if (existingIndex >= 0) {
      this.apps[existingIndex] = app;
    } else {
      this.apps.push(app);
    }
    this.save();
    return true;
  }

  async removeApp(id: string): Promise<boolean> {
    const initialLength = this.apps.length;
    this.apps = this.apps.filter(a => a.id !== id);
    if (this.apps.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  async getApp(id: string): Promise<CustomAppConfig | undefined> {
    return this.apps.find(a => a.id === id);
  }
}
