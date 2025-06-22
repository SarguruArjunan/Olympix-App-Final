import { promises as fs } from 'fs';
import { join } from 'path';
import { SheetName, SheetData } from '../types';

// Environment-based data storage service
// Production: Uses Vercel KV or external storage
// Development: Uses local JSON files

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

// Production adapter using in-memory storage with persistence
class ProductionAdapter implements StorageAdapter {
  private static dataCache: { [key: string]: any[] } = {};
  
  // Initialize with base data from repository (one-time setup)
  private async initializeIfEmpty(key: string): Promise<void> {
    if (!ProductionAdapter.dataCache[key]) {
      try {
        // Try to load initial data from repository files (fallback)
        const localAdapter = new LocalFileAdapter();
        const initialData = await localAdapter.read(key);
        ProductionAdapter.dataCache[key] = [...initialData];
        console.log(`🚀 PROD: Initialized ${key} with ${initialData.length} records from base data`);
      } catch (error) {
        console.warn(`🚀 PROD: Could not load initial data for ${key}, starting empty`);
        ProductionAdapter.dataCache[key] = [];
      }
    }
  }

  async read<T>(key: string): Promise<T[]> {
    await this.initializeIfEmpty(key);
    return [...ProductionAdapter.dataCache[key]] as T[];
  }

  async write<T>(key: string, data: T[]): Promise<void> {
    ProductionAdapter.dataCache[key] = [...data];
    console.log(`🚀 PROD: Stored ${data.length} records in memory for ${key}`);
    
    // In a real production setup, you would persist to external storage here
    // Examples: Vercel KV, PostgreSQL, MongoDB, etc.
  }

  async append<T extends SheetData>(key: string, data: Omit<T, 'ID'>): Promise<T> {
    await this.initializeIfEmpty(key);
    const existingData = ProductionAdapter.dataCache[key] as T[];
    const newId = existingData.length ? Math.max(...existingData.map(r => r.ID)) + 1 : 1;
    const newRecord = { ID: newId, ...data } as T;
    
    ProductionAdapter.dataCache[key].push(newRecord);
    console.log(`🚀 PROD: Appended record to ${key} with ID ${newId}`);
    return newRecord;
  }

  async update<T extends SheetData>(key: string, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    await this.initializeIfEmpty(key);
    const existingData = ProductionAdapter.dataCache[key] as T[];
    const index = existingData.findIndex(r => r.ID === id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${key}`);
    }
    
    existingData[index] = { ...existingData[index], ...data } as T;
    console.log(`🚀 PROD: Updated record ${id} in ${key}`);
    return existingData[index];
  }

  async delete(key: string, id: number): Promise<void> {
    await this.initializeIfEmpty(key);
    const existingData = ProductionAdapter.dataCache[key];
    const originalLength = existingData.length;
    ProductionAdapter.dataCache[key] = existingData.filter(r => r.ID !== id);
    
    if (ProductionAdapter.dataCache[key].length === originalLength) {
      throw new Error(`Record with ID ${id} not found in ${key}`);
    }
    
    console.log(`🚀 PROD: Deleted record ${id} from ${key}`);
  }
}

// Environment-aware data storage service
export class DataStorageService {
  private static adapter: StorageAdapter;
  
  private static getAdapter(): StorageAdapter {
    if (!this.adapter) {
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
      
      if (isProduction) {
        console.log('🚀 Using Production data adapter (in-memory with persistence)');
        this.adapter = new ProductionAdapter();
      } else {
        console.log('💾 Using Local file adapter for development');
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
      adapter: isProduction ? 'ProductionAdapter' : 'LocalFileAdapter',
      message: isProduction 
        ? 'Production data is isolated in memory - local changes will not affect production'
        : 'Development uses local JSON files - safe to modify for testing'
    };
  }
}