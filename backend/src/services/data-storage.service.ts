import { promises as fs } from 'fs';
import { join } from 'path';
import { SheetName, SheetData } from '../types';

// Environment-based data storage service
// Production: Uses separate JSON files in data/production/
// Development: Uses local JSON files in data/

interface StorageAdapter {
  read<T>(key: string): Promise<T[]>;
  write<T>(key: string, data: T[]): Promise<void>;
  append<T extends SheetData>(key: string, data: Omit<T, 'ID'>): Promise<T>;
  update<T extends SheetData>(key: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T>;
  delete(key: string, id: number): Promise<void>;
}

// Local JSON file adapter for development
class LocalFileAdapter implements StorageAdapter {
  private readonly dataDir = join(__dirname, '../../../data');
  
  private getFilePath(key: string): string {
    return join(this.dataDir, `sample-${key.toLowerCase()}.json`);
  }

  async read<T>(key: string): Promise<T[]> {
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      
      // Handle different JSON structures
      if (jsonData[key]) {
        return jsonData[key];
      } else if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        const dataArray = Object.values(jsonData).find(val => Array.isArray(val));
        return dataArray as T[] || [];
      }
    } catch (error) {
      console.warn(`Local file not found for ${key}, returning empty array`);
      return [];
    }
  }

  async write<T>(key: string, data: T[]): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      const filePath = this.getFilePath(key);
      
      // Create backup
      try {
        const backupPath = filePath.replace('.json', `_backup_${Date.now()}.json`);
        await fs.copyFile(filePath, backupPath);
      } catch (error) {
        // Backup failed, but continue
        console.warn(`Backup failed for ${key}:`, error);
      }
      
      const jsonData = { [key]: data };
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
      console.log(`💾 LOCAL: Wrote ${data.length} records to ${key}`);
    } catch (error) {
      console.error(`Error writing to local file ${key}:`, error);
      throw error;
    }
  }

  async append<T extends SheetData>(key: string, data: Omit<T, 'ID'>): Promise<T> {
    const existingData = await this.read<T>(key);
    const newId = existingData.length ? Math.max(...existingData.map(r => r.ID)) + 1 : 1;
    const newRecord = { ID: newId, ...data } as T;
    
    existingData.push(newRecord);
    await this.write(key, existingData);
    
    console.log(`💾 LOCAL: Appended record to ${key} with ID ${newId}`);
    return newRecord;
  }

  async update<T extends SheetData>(key: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    const existingData = await this.read<T>(key);
    const index = existingData.findIndex(r => r.ID === id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${key}`);
    }
    
    existingData[index] = { ...existingData[index], ...data } as T;
    await this.write(key, existingData);
    
    console.log(`💾 LOCAL: Updated record ${id} in ${key}`);
    return existingData[index];
  }

  async delete(key: string, id: number): Promise<void> {
    const existingData = await this.read(key);
    const filteredData = existingData.filter((r: any) => r.ID !== id);
    
    if (filteredData.length === existingData.length) {
      throw new Error(`Record with ID ${id} not found in ${key}`);
    }
    
    await this.write(key, filteredData);
    console.log(`💾 LOCAL: Deleted record ${id} from ${key}`);
  }
}

// Production JSON file adapter - uses separate directory for persistent storage
class ProductionAdapter implements StorageAdapter {
  private readonly prodDataDir = join(__dirname, '../../../data/production');
  
  private getFilePath(key: string): string {
    return join(this.prodDataDir, `prod-${key.toLowerCase()}.json`);
  }

  private async ensureProdDataDir(): Promise<void> {
    try {
      await fs.access(this.prodDataDir);
    } catch {
      await fs.mkdir(this.prodDataDir, { recursive: true });
      console.log(`🚀 PROD: Created production data directory: ${this.prodDataDir}`);
    }
  }

  private async initializeIfEmpty(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    
    try {
      await fs.access(filePath);
      // File exists, no need to initialize
    } catch {
      // File doesn't exist, initialize with base data
      try {
        console.log(`🚀 PROD: Initializing ${key} with base data from repository`);
        const basePath = join(__dirname, '../../../data', `sample-${key.toLowerCase()}.json`);
        const baseData = await fs.readFile(basePath, 'utf-8');
        const jsonData = JSON.parse(baseData);
        
        let initialData = [];
        if (jsonData[key]) {
          initialData = jsonData[key];
        } else if (Array.isArray(jsonData)) {
          initialData = jsonData;
        } else {
          const dataArray = Object.values(jsonData).find(val => Array.isArray(val));
          initialData = (dataArray as any[]) || [];
        }
        
        await this.ensureProdDataDir();
        const prodData = { [key]: initialData };
        await fs.writeFile(filePath, JSON.stringify(prodData, null, 2), 'utf-8');
        console.log(`🚀 PROD: Initialized ${key} with ${initialData.length} records in production file`);
      } catch (error) {
        console.warn(`🚀 PROD: Could not initialize ${key}, creating empty file`);
        await this.ensureProdDataDir();
        const emptyData = { [key]: [] };
        await fs.writeFile(filePath, JSON.stringify(emptyData, null, 2), 'utf-8');
      }
    }
  }

  async read<T>(key: string): Promise<T[]> {
    await this.initializeIfEmpty(key);
    
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      
      if (jsonData[key]) {
        return jsonData[key];
      } else if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        const dataArray = Object.values(jsonData).find(val => Array.isArray(val));
        return dataArray as T[] || [];
      }
    } catch (error) {
      console.error(`🚀 PROD: Error reading ${key}:`, error);
      return [];
    }
  }

  async write<T>(key: string, data: T[]): Promise<void> {
    try {
      await this.ensureProdDataDir();
      const filePath = this.getFilePath(key);
      
      // Create backup before writing
      try {
        const backupPath = filePath.replace('.json', `_backup_${Date.now()}.json`);
        await fs.copyFile(filePath, backupPath);
        console.log(`🚀 PROD: Backup created for ${key}`);
      } catch (error) {
        // Backup failed, but continue (file might not exist yet)
      }
      
      const jsonData = { [key]: data };
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
      console.log(`🚀 PROD: Wrote ${data.length} records to production file for ${key}`);
    } catch (error) {
      console.error(`🚀 PROD: Error writing ${key}:`, error);
      throw error;
    }
  }

  async append<T extends SheetData>(key: string, data: Omit<T, 'ID'>): Promise<T> {
    const existingData = await this.read<T>(key);
    const newId = existingData.length ? Math.max(...existingData.map(r => r.ID)) + 1 : 1;
    const newRecord = { ID: newId, ...data } as T;
    
    existingData.push(newRecord);
    await this.write(key, existingData);
    
    console.log(`🚀 PROD: Appended record to ${key} with ID ${newId} in production file`);
    return newRecord;
  }

  async update<T extends SheetData>(key: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    const existingData = await this.read<T>(key);
    const index = existingData.findIndex(r => r.ID === id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${key}`);
    }
    
    existingData[index] = { ...existingData[index], ...data } as T;
    await this.write(key, existingData);
    
    console.log(`🚀 PROD: Updated record ${id} in ${key} production file`);
    return existingData[index];
  }

  async delete(key: string, id: number): Promise<void> {
    const existingData = await this.read(key);
    const filteredData = existingData.filter((r: any) => r.ID !== id);
    
    if (filteredData.length === existingData.length) {
      throw new Error(`Record with ID ${id} not found in ${key}`);
    }
    
    await this.write(key, filteredData);
    console.log(`🚀 PROD: Deleted record ${id} from ${key} production file`);
  }
}

// Environment-aware data storage service
export class DataStorageService {
  private static adapter: StorageAdapter;
  
  private static getAdapter(): StorageAdapter {
    if (!this.adapter) {
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
      
      if (isProduction) {
        console.log('🚀 Using Production JSON file adapter (data/production/)');
        this.adapter = new ProductionAdapter();
      } else {
        console.log('💾 Using Local file adapter for development (data/)');
        this.adapter = new LocalFileAdapter();
      }
    }
    return this.adapter;
  }
  
  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    const adapter = this.getAdapter();
    return await adapter.read<T>(sheetName);
  }
  
  static async appendToSheet<T extends SheetData>(sheetName: SheetName, data: Omit<T, 'ID'>): Promise<T> {
    const adapter = this.getAdapter();
    return await adapter.append<T>(sheetName, data);
  }
  
  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    const adapter = this.getAdapter();
    return await adapter.update<T>(sheetName, id, data);
  }
  
  static async deleteFromSheet(sheetName: SheetName, id: number): Promise<void> {
    const adapter = this.getAdapter();
    return await adapter.delete(sheetName, id);
  }
  
  // Helper method to check current environment
  static getCurrentEnvironment(): string {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    return isProduction ? 'production' : 'development';
  }
  
  // Method to get storage info for debugging
  static getStorageInfo(): { environment: string; adapter: string; message: string } {
    const environment = this.getCurrentEnvironment();
    const isProduction = environment === 'production';
    
    return {
      environment,
      adapter: isProduction ? 'ProductionAdapter (JSON Files)' : 'LocalFileAdapter (JSON Files)',
      message: isProduction 
        ? 'Production uses separate JSON files in data/production/ - persistent and isolated'
        : 'Development uses local JSON files in data/ - safe to modify for testing'
    };
  }
}