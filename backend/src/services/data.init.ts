import { ExcelService } from './excel.service';
import { Sport, Team, Medal } from '../types';

export async function initializeSampleData() {
  console.log('Starting data initialization...');

  // Initialize Excel file with sheets
  await ExcelService.initializeWorkbook();

  // Sample teams data
  const teams: Omit<Team, 'ID'>[] = [
    {
      Name: 'Alpha Squad',
      Country: 'USA',
      Logo_URL: '/images/teams/alpha.png'
    },
    {
      Name: 'Beta Warriors',
      Country: 'UK',
      Logo_URL: '/images/teams/beta.png'
    },
    {
      Name: 'Gamma Force',
      Country: 'Germany',
      Logo_URL: '/images/teams/gamma.png'
    }
  ];

  // Add sample teams
  for (const team of teams) {
    await ExcelService.appendToSheet<Team>('Teams', team);
  }

  console.log('Sample data initialized successfully');
}