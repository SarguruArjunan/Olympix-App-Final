import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ExcelService } from '../services/excel.service';
import { DATA_DIR } from '../app';

async function initializeData(): Promise<void> {
  console.log('Starting data initialization...');
  try {
    // Initialize workbook and create basic structure
    await ExcelService.initializeWorkbook();

    // Read sample data files from project root data directory
    const rootDataDir = join(__dirname, '../../../data');
    const sampleSportsPath = join(rootDataDir, 'sample-sports.json');
    const sampleTeamsPath = join(rootDataDir, 'sample-teams.json');
    const sampleMedalsPath = join(rootDataDir, 'sample-medals.json');
    
    const sportsData = JSON.parse(await fs.readFile(sampleSportsPath, 'utf-8'));
    const teamsData = JSON.parse(await fs.readFile(sampleTeamsPath, 'utf-8'));
    const medalsData = JSON.parse(await fs.readFile(sampleMedalsPath, 'utf-8'));

    // Read existing workbook
    const workbook = XLSX.readFile(join(DATA_DIR, 'EventData.xlsx'));

    // Update Sports sheet with sample data
    const sportsWorksheet = XLSX.utils.json_to_sheet(sportsData.Sports);
    workbook.Sheets['Sports'] = sportsWorksheet;

    // Update Teams sheet with sample data
    const teamsWorksheet = XLSX.utils.json_to_sheet(teamsData.Teams);
    workbook.Sheets['Teams'] = teamsWorksheet;

    // Update Events sheet with sample data
    const eventsWorksheet = XLSX.utils.json_to_sheet(sportsData.Events);
    workbook.Sheets['Events'] = eventsWorksheet;

    // Update Medals sheet with sample data
    const medalsWorksheet = XLSX.utils.json_to_sheet(medalsData.Medals);
    workbook.Sheets['Medals'] = medalsWorksheet;

    // Write back to file
    XLSX.writeFile(workbook, join(DATA_DIR, 'EventData.xlsx'));

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}

if (require.main === module) {
  initializeData().catch(console.error);
}

export default initializeData;