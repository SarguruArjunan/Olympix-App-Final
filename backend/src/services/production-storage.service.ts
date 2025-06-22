import { SheetName, SheetData } from '../types';

// Production persistent storage using Vercel Blob/KV or external storage
// This provides real persistence for production data

export class ProductionStorageService {
  private static readonly STORAGE_PREFIX = 'olympix_prod_';
  
  // Environment check
  private static isProduction(): boolean {
    return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  }
  
  // Get storage key for a sheet
  private static getStorageKey(sheetName: SheetName): string {
    return `${this.STORAGE_PREFIX}${sheetName.toLowerCase()}`;
  }
  
  // For now, we'll use a hybrid approach:
  // 1. Try to use external storage (Vercel KV, Database, etc.)
  // 2. Fall back to environment variables for small data
  // 3. Use local files as last resort (but with protection)
  
  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    try {
      // TODO: Implement with Vercel KV or database
      // For now, use environment-aware approach
      
      if (this.isProduction()) {
        // In production, we could use:
        // - Vercel KV (Redis-based key-value storage)
        // - Vercel Postgres
        // - External database (Supabase, MongoDB Atlas, etc.)
        
        console.log(`🚀 PROD: Reading ${sheetName} from persistent storage`);
        
        // For immediate solution, use a combination approach:
        // 1. Check if we have stored data in memory cache
        // 2. If not, initialize from base repository data
        // 3. TODO: Replace with actual database
        
        return this.getProductionData<T>(sheetName);
      } else {
        // Development - use local files
        console.log(`💾 DEV: Reading ${sheetName} from local files`);
        return this.getLocalData<T>(sheetName);
      }
    } catch (error) {
      console.error(`Error reading ${sheetName}:`, error);
      return [];
    }
  }
  
  static async writeSheet<T extends SheetData>(sheetName: SheetName, data: T[]): Promise<void> {
    try {
      if (this.isProduction()) {
        console.log(`🚀 PROD: Writing ${data.length} records to persistent storage for ${sheetName}`);
        
        // TODO: Implement with actual persistent storage
        // For now, log what would be saved
        await this.saveProductionData(sheetName, data);
      } else {
        console.log(`💾 DEV: Writing ${data.length} records to local files for ${sheetName}`);
        await this.saveLocalData(sheetName, data);
      }
    } catch (error) {
      console.error(`Error writing ${sheetName}:`, error);
      throw error;
    }
  }
  
  // Production data management (to be replaced with real database)
  private static productionCache: { [key: string]: any[] } = {};
  
  private static async getProductionData<T>(sheetName: SheetName): Promise<T[]> {
    const key = this.getStorageKey(sheetName);
    
    if (!this.productionCache[key]) {
      // Initialize with base data from repository (one-time)
      console.log(`🚀 PROD: Initializing ${sheetName} with base data`);
      this.productionCache[key] = await this.loadBaseData<T>(sheetName);
    }
    
    return [...this.productionCache[key]];
  }
  
  private static async saveProductionData<T>(sheetName: SheetName, data: T[]): Promise<void> {
    const key = this.getStorageKey(sheetName);
    this.productionCache[key] = [...data];
    
    // TODO: Here you would save to actual persistent storage
    // Examples:
    // await vercelKV.set(key, JSON.stringify(data));
    // await database.collection(sheetName).replaceMany({}, data);
    // await fetch('/api/external-storage', { method: 'POST', body: JSON.stringify({ key, data }) });
    
    console.log(`🚀 PROD: Cached ${data.length} records for ${sheetName} (TODO: Implement real persistence)`);
  }
  
  private static async loadBaseData<T>(sheetName: SheetName): Promise<T[]> {
    // Load initial data from repository files
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      
      const dataDir = path.join(process.cwd(), 'data');
      const filePath = path.join(dataDir, `sample-${sheetName.toLowerCase()}.json`);
      
      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      
      if (jsonData[sheetName]) {
        return jsonData[sheetName];
      } else if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        const dataArray = Object.values(jsonData).find(val => Array.isArray(val));
        return dataArray as T[] || [];
      }
    } catch (error) {
      console.warn(`Could not load base data for ${sheetName}:`, error);
      return [];
    }
  }
  
  private static async getLocalData<T>(sheetName: SheetName): Promise<T[]> {
    // Use the existing local file logic
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(__dirname, '../../../data');
    const filePath = path.join(dataDir, `sample-${sheetName.toLowerCase()}.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      
      if (jsonData[sheetName]) {
        return jsonData[sheetName];
      } else if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        const dataArray = Object.values(jsonData).find(val => Array.isArray(val));
        return dataArray as T[] || [];
      }
    } catch (error) {
      console.warn(`Local file not found for ${sheetName}:`, error);
      return [];
    }
  }
  
  private static async saveLocalData<T>(sheetName: SheetName, data: T[]): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(__dirname, '../../../data');
    const filePath = path.join(dataDir, `sample-${sheetName.toLowerCase()}.json`);
    
    try {
      await fs.mkdir(dataDir, { recursive: true });
      
      // Create backup
      try {
        const backupPath = filePath.replace('.json', `_backup_${Date.now()}.json`);
        await fs.copyFile(filePath, backupPath);
      } catch (error) {
        console.warn(`Backup failed for ${sheetName}:`, error);
      }
      
      const jsonData = { [sheetName]: data };
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing local file for ${sheetName}:`, error);
      throw error;
    }
  }
  
  // Migration helper for future database implementation
  static async migrateToDatabase(): Promise<void> {
    console.log('🔄 Starting migration to persistent database...');
    
    // This would be used when implementing actual database
    // Example migration steps:
    // 1. Connect to database
    // 2. Create tables/collections
    // 3. Migrate existing data
    // 4. Update storage service to use database
    
    console.log('⚠️  Migration not implemented yet - using in-memory cache with base data initialization');
  }
  
  // Health check for storage system
  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const environment = this.isProduction() ? 'production' : 'development';
      
      if (this.isProduction()) {
        // Check production storage health
        const cacheStatus = Object.keys(this.productionCache).length > 0 ? 'initialized' : 'empty';
        
        return {
          status: 'operational',
          details: {
            environment,
            storage: 'in-memory-cache',
            cache_status: cacheStatus,
            warning: 'Using temporary in-memory storage - data will be lost on restart',
            recommendation: 'Implement persistent database for production'
          }
        };
      } else {
        // Check local file storage health
        return {
          status: 'operational',
          details: {
            environment,
            storage: 'local-files',
            note: 'Development environment using local JSON files'
          }
        };
      }
    } catch (error) {
      return {
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}