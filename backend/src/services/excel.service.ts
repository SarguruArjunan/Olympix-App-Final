import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import lockfile from 'proper-lockfile';
import { EXCEL_FILE, DATA_DIR } from '../app';
import { SheetName, SheetData } from '../types';

interface ExcelOperation<T> {
  (): Promise<T>;
}

export class ExcelService {
  private static async withLock<T>(operation: ExcelOperation<T>): Promise<T> {
    const release = await lockfile.lock(EXCEL_FILE, { retries: 5 });
    try {
      return await operation();
    } finally {
      await release();
    }
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

    // Create a new workbook regardless of whether it exists
    const workbook = XLSX.utils.book_new();

    // Create sheets with headers
    const sheets: Record<SheetName, string[]> = {
      'Sports': ['ID', 'Name', 'Icon_URL', 'Description'],
      'Teams': ['ID', 'Name', 'Country', 'Logo_URL'],
      'Players': ['ID', 'FirstName', 'LastName', 'TeamID', 'SportID'],
      'Events': ['ID', 'SportID', 'Name', 'Date', 'Time', 'Location'],
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
      const workbook = XLSX.readFile(EXCEL_FILE);
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<T>(worksheet);
      
      const newId = rows.length ? Math.max(...rows.map(r => r.ID)) + 1 : 1;
      const newRow = { ID: newId, ...data } as T;
      
      rows.push(newRow);
      
      const newWorksheet = XLSX.utils.json_to_sheet(rows);
      workbook.Sheets[sheetName] = newWorksheet;
      
      XLSX.writeFile(workbook, EXCEL_FILE);
    });
  }

  static async updateInSheet<T extends SheetData>(sheetName: SheetName, id: number, data: Partial<Omit<T, 'ID'>>): Promise<void> {
    await this.withLock(async () => {
      const workbook = XLSX.readFile(EXCEL_FILE);
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<T>(worksheet);
      
      const index = rows.findIndex(r => r.ID === id);
      if (index === -1) throw new Error('Record not found');
      
      rows[index] = { ...rows[index], ...data } as T;
      
      const newWorksheet = XLSX.utils.json_to_sheet(rows);
      workbook.Sheets[sheetName] = newWorksheet;
      
      XLSX.writeFile(workbook, EXCEL_FILE);
    });
  }

  static async deleteFromSheet<T extends SheetData>(sheetName: SheetName, id: number): Promise<void> {
    await this.withLock(async () => {
      const workbook = XLSX.readFile(EXCEL_FILE);
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<T>(worksheet);
      
      const filteredRows = rows.filter(r => r.ID !== id);
      
      const newWorksheet = XLSX.utils.json_to_sheet(filteredRows);
      workbook.Sheets[sheetName] = newWorksheet;
      
      XLSX.writeFile(workbook, EXCEL_FILE);
    });
  }
}