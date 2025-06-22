import { SheetName, SheetData } from '../types';
import { DataStorageService } from './data-storage.service';

// Legacy wrapper around DataStorageService for backward compatibility
// This ensures existing code continues to work while providing environment separation
export class JsonService {
  
  // Environment info for debugging
  static getEnvironmentInfo() {
    return DataStorageService.getStorageInfo();
  }

  static async validateDataFiles(): Promise<boolean> {
    try {
      const environment = DataStorageService.getCurrentEnvironment();
      console.log(`🔍 Validating data files for ${environment} environment...`);
      
      if (environment === 'production') {
        console.log('🚀 Production environment - using in-memory storage with base data initialization');
        return true;
      } else {
        console.log('💾 Development environment - using local JSON files');
        // For development, we could add file validation if needed
        return true;
      }
    } catch (error) {
      console.error('Data files validation failed:', error);
      return false;
    }
  }

  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    try {
      return await DataStorageService.readSheet<T>(sheetName);
    } catch (error) {
      console.error(`Error reading sheet ${sheetName}:`, error);
      throw error;
    }
  }

  static async appendToSheet<T extends SheetData>(sheetName: SheetName, data: Omit<T, 'ID'>): Promise<T> {
    try {
      console.log(`Attempting to append data to ${sheetName}:`, data);
      const result = await DataStorageService.appendToSheet<T>(sheetName, data);
      console.log(`Successfully appended data to ${sheetName} with ID ${result.ID}`);
      return result;
    } catch (error) {
      console.error(`Error appending to ${sheetName}:`, error);
      throw error;
    }
  }

  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<T> {
    try {
      const result = await DataStorageService.updateInSheet<T>(sheetName, id, data);
      console.log(`Successfully updated record ${id} in ${sheetName}`);
      return result;
    } catch (error) {
      console.error(`Error updating ${sheetName}:`, error);
      throw error;
    }
  }

  static async deleteFromSheet(sheetName: SheetName, id: number): Promise<void> {
    try {
      await DataStorageService.deleteFromSheet(sheetName, id);
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

  // Debug method to show current storage configuration
  static logStorageInfo(): void {
    const info = this.getEnvironmentInfo();
    console.log('📊 Storage Configuration:');
    console.log(`   Environment: ${info.environment}`);
    console.log(`   Adapter: ${info.adapter}`);
    console.log(`   Info: ${info.message}`);
  }
}