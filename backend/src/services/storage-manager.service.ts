import { SheetName, SheetData } from '../types';
import { DataStorageService } from './data-storage.service';
import { DatabaseService } from './database.service';

// Storage Manager - bridges current system with new database solution
// Provides smooth transition from JSON files to PostgreSQL

export class StorageManagerService {
  private static useDatabase = false; // Toggle for gradual migration
  
  // Enable database mode (call this to switch to PostgreSQL)
  static enableDatabaseMode() {
    this.useDatabase = true;
    console.log('🔄 Switched to Database mode (PostgreSQL)');
  }
  
  // Disable database mode (fall back to current JSON system)
  static enableFileMode() {
    this.useDatabase = false;
    console.log('📁 Switched to File mode (JSON)');
  }
  
  // Auto-detect best storage based on environment
  static autoDetectStorage() {
    const hasPostgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    this.useDatabase = !!hasPostgresUrl;
    
    if (this.useDatabase) {
      console.log('🗄️ Auto-detected: Using PostgreSQL database');
    } else {
      console.log('📁 Auto-detected: Using JSON files');
    }
  }
  
  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    if (this.useDatabase) {
      return await DatabaseService.readSheet<T>(sheetName);
    } else {
      return await DataStorageService.readSheet<T>(sheetName);
    }
  }
  
  static async appendToSheet<T extends SheetData>(sheetName: SheetName, data: Omit<T, 'ID'>): Promise<T> {
    if (this.useDatabase) {
      return await DatabaseService.appendToSheet<T>(sheetName, data);
    } else {
      return await DataStorageService.appendToSheet<T>(sheetName, data);
    }
  }
  
  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    if (this.useDatabase) {
      return await DatabaseService.updateInSheet<T>(sheetName, id, data);
    } else {
      return await DataStorageService.updateInSheet<T>(sheetName, id, data);
    }
  }
  
  static async deleteFromSheet(sheetName: SheetName, id: number): Promise<void> {
    if (this.useDatabase) {
      return await DatabaseService.deleteFromSheet(sheetName, id);
    } else {
      return await DataStorageService.deleteFromSheet(sheetName, id);
    }
  }
  
  static getCurrentEnvironment(): string {
    return this.useDatabase ? 'database' : 'files';
  }
  
  static getStorageInfo(): { environment: string; adapter: string; message: string } {
    if (this.useDatabase) {
      return DatabaseService.getEnvironmentInfo();
    } else {
      return DataStorageService.getStorageInfo();
    }
  }
  
  // Migration helper: copy data from JSON files to database
  static async migrateFromFilesToDatabase(): Promise<void> {
    console.log('🔄 Starting migration from JSON files to PostgreSQL...');
    
    const sheets: SheetName[] = ['Sports', 'Teams', 'Players', 'Events', 'Medals'];
    
    for (const sheet of sheets) {
      try {
        console.log(`📦 Migrating ${sheet}...`);
        
        // Read from JSON files
        this.useDatabase = false;
        const data = await this.readSheet(sheet);
        
        // Write to database
        this.useDatabase = true;
        for (const item of data) {
          const { ID, ...itemData } = item;
          await this.appendToSheet(sheet, itemData);
        }
        
        console.log(`✅ Migrated ${data.length} records from ${sheet}`);
      } catch (error) {
        console.error(`❌ Migration failed for ${sheet}:`, error);
      }
    }
    
    console.log('🎉 Migration completed!');
  }
  
  // Health check for current storage system
  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (this.useDatabase) {
        return await DatabaseService.healthCheck();
      } else {
        return {
          status: 'healthy',
          details: {
            storage: 'JSON Files',
            adapter: DataStorageService.getStorageInfo().adapter,
            environment: DataStorageService.getCurrentEnvironment()
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

// Initialize storage on import
StorageManagerService.autoDetectStorage();

// Add diagnostic logging
console.log('🔍 STORAGE MANAGER DIAGNOSTICS:');
console.log(`📊 Current storage mode: ${StorageManagerService.getCurrentEnvironment()}`);
console.log(`🌍 Environment variables check:`);
console.log(`   - POSTGRES_URL: ${process.env.POSTGRES_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);