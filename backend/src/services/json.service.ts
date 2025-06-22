import { promises as fs } from 'fs';
import { join } from 'path';
import { SheetName, SheetData } from '../types';

// Point to the main data directory (one level up from backend)
const DATA_DIR = join(__dirname, '../../../data');

interface JsonDataFiles {
  Sports: string;
  Teams: string;
  Players: string;
  Events: string;
  Matches: string;
  Medals: string;
}

export class JsonService {
  private static readonly dataFiles: JsonDataFiles = {
    Sports: join(DATA_DIR, 'sample-sports.json'),
    Teams: join(DATA_DIR, 'sample-teams.json'),
    Players: join(DATA_DIR, 'sample-players.json'),
    Events: join(DATA_DIR, 'sample-events.json'),
    Matches: join(DATA_DIR, 'sample-matches.json'),
    Medals: join(DATA_DIR, 'sample-medals.json')
  };

  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private static async readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      
      // Handle different JSON structures - some files have root arrays, some have named properties
      const fileName = filePath.split('/').pop()?.replace('.json', '');
      const key = fileName?.replace('sample-', '').replace(/^\w/, c => c.toUpperCase());
      
      if (key && jsonData[key]) {
        return jsonData[key];
      } else if (Array.isArray(jsonData)) {
        return jsonData;
      } else {
        // Try to find the data array in the object
        const dataArray = Object.values(jsonData).find(val => Array.isArray(val));
        return dataArray as T[] || [];
      }
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      return [];
    }
  }

  private static async writeJsonFile<T>(filePath: string, data: T[], sheetName: SheetName): Promise<void> {
    try {
      await this.ensureDataDir();
      
      // Create backup before writing
      await this.createBackup(filePath);
      
      // Write data with proper structure
      const jsonData = { [sheetName]: data };
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
      
      console.log(`Successfully wrote ${data.length} records to ${filePath}`);
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      throw error;
    }
  }

  private static async createBackup(filePath: string): Promise<void> {
    try {
      const backupPath = filePath.replace('.json', `_backup_${Date.now()}.json`);
      await fs.copyFile(filePath, backupPath);
      console.log(`Backup created: ${backupPath}`);
      
      // Clean up old backups (keep only last 5)
      await this.cleanupOldBackups(filePath);
    } catch (error) {
      console.warn(`Failed to create backup for ${filePath}:`, error);
    }
  }

  private static async cleanupOldBackups(originalPath: string): Promise<void> {
    try {
      const dir = originalPath.split('/').slice(0, -1).join('/');
      const baseName = originalPath.split('/').pop()?.replace('.json', '');
      
      const files = await fs.readdir(dir);
      const backupFiles = files
        .filter(file => file.includes(`${baseName}_backup_`) && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: join(dir, file),
          time: parseInt(file.match(/_backup_(\d+)\.json$/)?.[1] || '0')
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the 5 most recent backups
      const filesToDelete = backupFiles.slice(5);
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      }
    } catch (error) {
      console.warn('Failed to cleanup old backups:', error);
    }
  }

  static async validateDataFiles(): Promise<boolean> {
    try {
      for (const [sheetName, filePath] of Object.entries(this.dataFiles)) {
        try {
          await fs.access(filePath);
          // Try to read and parse the file
          await this.readJsonFile(filePath);
          console.log(`✓ ${sheetName} data file validated: ${filePath}`);
        } catch (error) {
          console.error(`✗ ${sheetName} data file validation failed: ${filePath}`, error);
          return false;
        }
      }
      console.log('All JSON data files validation passed');
      return true;
    } catch (error) {
      console.error('JSON data files validation failed:', error);
      return false;
    }
  }

  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    const filePath = this.dataFiles[sheetName as keyof JsonDataFiles];
    if (!filePath) {
      throw new Error(`No data file configured for sheet: ${sheetName}`);
    }
    
    return await this.readJsonFile<T>(filePath);
  }

  static async appendToSheet<T extends SheetData>(sheetName: SheetName, data: Omit<T, 'ID'>): Promise<T> {
    try {
      console.log(`Attempting to append data to ${sheetName}:`, data);
      
      const filePath = this.dataFiles[sheetName as keyof JsonDataFiles];
      if (!filePath) {
        throw new Error(`No data file configured for sheet: ${sheetName}`);
      }

      const existingData = await this.readJsonFile<T>(filePath);
      
      // Generate new ID
      const newId = existingData.length ? Math.max(...existingData.map(r => r.ID)) + 1 : 1;
      console.log(`Assigning new ID: ${newId}`);
      
      const newRecord = { ID: newId, ...data } as T;
      console.log(`Adding record:`, newRecord);
      
      existingData.push(newRecord);
      
      await this.writeJsonFile(filePath, existingData, sheetName);
      console.log(`Successfully appended data to ${sheetName} with ID ${newId}`);
      
      return newRecord;
    } catch (error) {
      console.error(`Error appending to ${sheetName}:`, error);
      throw error;
    }
  }

  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    try {
      const filePath = this.dataFiles[sheetName as keyof JsonDataFiles];
      if (!filePath) {
        throw new Error(`No data file configured for sheet: ${sheetName}`);
      }

      const existingData = await this.readJsonFile<T>(filePath);
      
      const index = existingData.findIndex(r => r.ID === id);
      if (index === -1) {
        throw new Error('Record not found');
      }
      
      existingData[index] = { ...existingData[index], ...data } as T;
      
      await this.writeJsonFile(filePath, existingData, sheetName);
      console.log(`Successfully updated record ${id} in ${sheetName}`);
      
      return existingData[index];
    } catch (error) {
      console.error(`Error updating ${sheetName}:`, error);
      throw error;
    }
  }

  static async deleteFromSheet<T extends SheetData>(sheetName: SheetName, id: number): Promise<void> {
    try {
      const filePath = this.dataFiles[sheetName as keyof JsonDataFiles];
      if (!filePath) {
        throw new Error(`No data file configured for sheet: ${sheetName}`);
      }

      const existingData = await this.readJsonFile<T>(filePath);
      
      const originalLength = existingData.length;
      const filteredData = existingData.filter(r => r.ID !== id);
      
      if (filteredData.length === originalLength) {
        throw new Error(`Record with ID ${id} not found`);
      }
      
      await this.writeJsonFile(filePath, filteredData, sheetName);
      console.log(`Successfully deleted record ${id} from ${sheetName}`);
    } catch (error) {
      console.error(`Error deleting from ${sheetName}:`, error);
      throw error;
    }
  }

  // Helper method to get all data at once (useful for admin tools)
  static async getAllData() {
    try {
      const sports = await this.readSheet('Sports');
      const teams = await this.readSheet('Teams');
      const players = await this.readSheet('Players');
      const events = await this.readSheet('Events');
      const medals = await this.readSheet('Medals');
      
      return {
        sports,
        teams,
        players,
        events,
        medals
      };
    } catch (error) {
      console.error('Error getting all data:', error);
      throw error;
    }
  }
}