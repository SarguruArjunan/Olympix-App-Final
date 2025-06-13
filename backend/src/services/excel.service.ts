import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import { join } from 'path';
import lockfile from 'proper-lockfile';
import { EXCEL_FILE, DATA_DIR } from '../app';
import { SheetName, SheetData } from '../types';

interface ExcelOperation<T> {
  (): Promise<T>;
}

export class ExcelService {
  private static readonly MAX_CELL_LENGTH = 32000; // Slightly less than Excel's 32767 limit

  private static async withLock<T>(operation: ExcelOperation<T>): Promise<T> {
    const release = await lockfile.lock(EXCEL_FILE, { retries: 5 });
    try {
      return await operation();
    } finally {
      await release();
    }
  }

  private static validateAndTruncateData<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data } as any;
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && value.length > this.MAX_CELL_LENGTH) {
        console.warn(`Field '${key}' exceeds max length (${value.length} chars), truncating to ${this.MAX_CELL_LENGTH} chars`);
        sanitized[key] = value.substring(0, this.MAX_CELL_LENGTH) + '...[truncated]';
      }
    }
    
    return sanitized as T;
  }

  private static async createBackup(): Promise<void> {
    try {
      // Temporarily disabled to prevent corruption loop
      console.log('Backup creation temporarily disabled to prevent corruption issues');
      return;
      
      const backupFile = EXCEL_FILE.replace('.xlsx', `_backup_${Date.now()}.xlsx`);
      await fs.copyFile(EXCEL_FILE, backupFile);
      console.log(`Backup created: ${backupFile}`);
      
      // Clean up old backups (keep only last 5)
      await this.cleanupOldBackups();
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  private static async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(DATA_DIR);
      const backupFiles = files
        .filter(file => file.includes('_backup_') && file.endsWith('.xlsx'))
        .map(file => ({
          name: file,
          path: join(DATA_DIR, file),
          time: parseInt(file.match(/_backup_(\d+)\.xlsx$/)?.[1] || '0')
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

  static async validateExcelFile(): Promise<boolean> {
    try {
      await fs.access(EXCEL_FILE);
      
      // Try to read the file to check for corruption
      const workbook = XLSX.readFile(EXCEL_FILE);
      
      // Check if all required sheets exist
      const requiredSheets: SheetName[] = ['Sports', 'Teams', 'Players', 'Events', 'Matches', 'Medals'];
      for (const sheetName of requiredSheets) {
        if (!workbook.Sheets[sheetName]) {
          console.error(`Missing required sheet: ${sheetName}`);
          return false;
        }
      }
      
      console.log('Excel file validation passed');
      return true;
    } catch (error) {
      console.error('Excel file validation failed:', error);
      
      // If validation fails, try to recreate the file
      console.log('Attempting to recreate corrupted Excel file...');
      try {
        await this.recreateCorruptedFile();
        return true;
      } catch (recreateError) {
        console.error('Failed to recreate Excel file:', recreateError);
        return false;
      }
    }
  }

  private static async recreateCorruptedFile(): Promise<void> {
    console.log('Recreating Excel file due to corruption...');
    
    // Backup the corrupted file if possible
    try {
      const corruptedFile = EXCEL_FILE.replace('.xlsx', `_corrupted_${Date.now()}.xlsx`);
      await fs.copyFile(EXCEL_FILE, corruptedFile);
      console.log(`Corrupted file backed up to: ${corruptedFile}`);
    } catch (error) {
      console.warn('Could not backup corrupted file:', error);
    }

    // Delete the corrupted file
    try {
      await fs.unlink(EXCEL_FILE);
    } catch (error) {
      console.warn('Could not delete corrupted file:', error);
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    const sheets: Record<SheetName, string[]> = {
      'Sports': ['ID', 'Name', 'Icon_URL', 'Description'],
      'Teams': ['ID', 'Name', 'Country', 'Logo_URL', 'Organization', 'TagLine', 'Color'],
      'Players': ['ID', 'FirstName', 'LastName', 'TeamID', 'SportID'],
      'Events': ['ID', 'SportID', 'Name', 'Date', 'Time', 'Location', 'TeamA_ID', 'TeamB_ID', 'Status', 'WinnerTeamID', 'TeamA_Score', 'TeamB_Score', 'ResultNotes'],
      'Matches': ['ID', 'EventID', 'ParticipantA_ID', 'ParticipantB_ID', 'ScoreA', 'ScoreB', 'WinnerID', 'Status'],
      'Medals': ['ID', 'TeamID', 'SportID', 'Gold', 'Silver', 'Bronze', 'Total']
    };

    Object.entries(sheets).forEach(([name, headers]) => {
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(workbook, ws, name);
    });

    XLSX.writeFile(workbook, EXCEL_FILE);
    console.log('Excel file recreated successfully');
  }

  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  static async initializeWorkbook(): Promise<void> {
    await this.ensureDataDir();

    // Check if Excel file already exists
    try {
      await fs.access(EXCEL_FILE);
      console.log('Excel file already exists, skipping initialization');
      return; // Don't overwrite existing data
    } catch {
      console.log('Excel file does not exist, creating new one');
    }

    // Create a new workbook only if it doesn't exist
    const workbook = XLSX.utils.book_new();

    // Create sheets with headers
    const sheets: Record<SheetName, string[]> = {
      'Sports': ['ID', 'Name', 'Icon_URL', 'Description'],
      'Teams': ['ID', 'Name', 'Country', 'Logo_URL', 'Organization', 'TagLine', 'Color'],
      'Players': ['ID', 'FirstName', 'LastName', 'TeamID', 'SportID'],
      'Events': ['ID', 'SportID', 'Name', 'Date', 'Time', 'Location', 'TeamA_ID', 'TeamB_ID', 'Status', 'WinnerTeamID', 'TeamA_Score', 'TeamB_Score', 'ResultNotes'],
      'Matches': ['ID', 'EventID', 'ParticipantA_ID', 'ParticipantB_ID', 'ScoreA', 'ScoreB', 'WinnerID', 'Status'],
      'Medals': ['ID', 'TeamID', 'SportID', 'Gold', 'Silver', 'Bronze', 'Total']
    };

    Object.entries(sheets).forEach(([name, headers]) => {
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(workbook, ws, name);
    });

    // Write the file first
    XLSX.writeFile(workbook, EXCEL_FILE);
    console.log('Excel file created');
  }

  static async readSheet<T extends SheetData>(sheetName: SheetName): Promise<T[]> {
    return await this.withLock(async () => {
      const workbook = XLSX.readFile(EXCEL_FILE);
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json<T>(worksheet);
    });
  }

  static async appendToSheet<T extends SheetData>(sheetName: SheetName, data: Omit<T, 'ID'>): Promise<void> {
    await this.withLock(async () => {
      try {
        console.log(`Attempting to append data to ${sheetName} sheet:`, data);
        
        // Create backup before modifying
        await this.createBackup();
        
        // Validate Excel file exists and is readable
        try {
          await fs.access(EXCEL_FILE);
        } catch (error) {
          throw new Error(`Excel file not found: ${EXCEL_FILE}`);
        }
        
        const workbook = XLSX.readFile(EXCEL_FILE);
        
        if (!workbook.Sheets[sheetName]) {
          throw new Error(`Sheet '${sheetName}' not found in Excel file`);
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<T>(worksheet);
        
        const newId = rows.length ? Math.max(...rows.map(r => r.ID)) + 1 : 1;
        console.log(`Assigning new ID: ${newId}`);
        
        const sanitizedData = this.validateAndTruncateData({ ID: newId, ...data });
        const newRow = sanitizedData as T;
        
        console.log(`Adding row:`, newRow);
        rows.push(newRow);
        
        const newWorksheet = XLSX.utils.json_to_sheet(rows);
        workbook.Sheets[sheetName] = newWorksheet;
        
        XLSX.writeFile(workbook, EXCEL_FILE);
        console.log(`Successfully appended data to ${sheetName} sheet with ID ${newId}`);
      } catch (error) {
        console.error(`Error appending to ${sheetName}:`, error);
        if (error instanceof Error) {
          console.error(`Error message: ${error.message}`);
          console.error(`Error stack: ${error.stack}`);
        }
        throw error;
      }
    });
  }

  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<void> {
    await this.withLock(async () => {
      try {
        // Create backup before modifying
        await this.createBackup();
        
        const workbook = XLSX.readFile(EXCEL_FILE);
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<T>(worksheet);
        
        const index = rows.findIndex(r => r.ID === id);
        if (index === -1) throw new Error('Record not found');
        
        const sanitizedData = this.validateAndTruncateData(data);
        rows[index] = { ...rows[index], ...sanitizedData } as T;
        
        const newWorksheet = XLSX.utils.json_to_sheet(rows);
        workbook.Sheets[sheetName] = newWorksheet;
        
        XLSX.writeFile(workbook, EXCEL_FILE);
        console.log(`Successfully updated record ${id} in ${sheetName} sheet`);
      } catch (error) {
        console.error(`Error updating ${sheetName}:`, error);
        throw error;
      }
    });
  }

  static async deleteFromSheet<T extends SheetData>(sheetName: SheetName, id: number): Promise<void> {
    await this.withLock(async () => {
      try {
        // Create backup before modifying
        await this.createBackup();
        
        const workbook = XLSX.readFile(EXCEL_FILE);
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<T>(worksheet);
        
        const originalLength = rows.length;
        const filteredRows = rows.filter(r => r.ID !== id);
        
        if (filteredRows.length === originalLength) {
          throw new Error(`Record with ID ${id} not found`);
        }
        
        const newWorksheet = XLSX.utils.json_to_sheet(filteredRows);
        workbook.Sheets[sheetName] = newWorksheet;
        
        XLSX.writeFile(workbook, EXCEL_FILE);
        console.log(`Successfully deleted record ${id} from ${sheetName} sheet`);
      } catch (error) {
        console.error(`Error deleting from ${sheetName}:`, error);
        throw error;
      }
    });
  }
}