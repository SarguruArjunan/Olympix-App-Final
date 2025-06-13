import { ExcelService } from './excel.service';
import { Team, Medal, Player } from '../types';

export async function initializeSampleData() {
  console.log('Starting data initialization...');

  // Initialize Excel file with sheets
  await ExcelService.initializeWorkbook();

  // Sample teams data
  const teams: Omit<Team, 'ID'>[] = [
    {
      Name: 'Alpha Squad',
      Country: 'USA',
      Logo_URL: '',
      Organization: 'Alpha Corp',
      TagLine: 'Leading the way to victory',
      Color: '#FF6B35'
    },
    {
      Name: 'Beta Warriors',
      Country: 'UK',
      Logo_URL: '',
      Organization: 'Beta Industries',
      TagLine: 'Strength through unity',
      Color: '#4ECDC4'
    },
    {
      Name: 'Gamma Force',
      Country: 'Germany',
      Logo_URL: '',
      Organization: 'Gamma Technologies',
      TagLine: 'Innovation meets excellence',
      Color: '#45B7D1'
    }
  ];

  // Add sample teams
  for (const team of teams) {
    await ExcelService.appendToSheet<Team>('Teams', team);
  }

  // Sample players data
  const players: Omit<Player, 'ID'>[] = [
    // Alpha Squad players
    { FirstName: 'John', LastName: 'Smith', TeamID: 1, SportID: 1 }, // Foosball
    { FirstName: 'Sarah', LastName: 'Johnson', TeamID: 1, SportID: 1 }, // Foosball
    { FirstName: 'Mike', LastName: 'Chen', TeamID: 1, SportID: 3 }, // Chess
    { FirstName: 'Anna', LastName: 'Williams', TeamID: 1, SportID: 4 }, // Table Tennis
    { FirstName: 'David', LastName: 'Brown', TeamID: 1, SportID: 4 }, // Table Tennis
    
    // Beta Warriors players
    { FirstName: 'Emily', LastName: 'Davis', TeamID: 2, SportID: 2 }, // Carrom
    { FirstName: 'Robert', LastName: 'Miller', TeamID: 2, SportID: 2 }, // Carrom
    { FirstName: 'Lisa', LastName: 'Wilson', TeamID: 2, SportID: 5 }, // Badminton
    { FirstName: 'James', LastName: 'Moore', TeamID: 2, SportID: 5 }, // Badminton
    { FirstName: 'Jessica', LastName: 'Taylor', TeamID: 2, SportID: 7 }, // Football
    { FirstName: 'Chris', LastName: 'Anderson', TeamID: 2, SportID: 7 }, // Football
    
    // Gamma Force players
    { FirstName: 'Alex', LastName: 'Garcia', TeamID: 3, SportID: 6 }, // Cricket
    { FirstName: 'Maria', LastName: 'Rodriguez', TeamID: 3, SportID: 6 }, // Cricket
    { FirstName: 'Kevin', LastName: 'Martinez', TeamID: 3, SportID: 8 }, // Basketball
    { FirstName: 'Amanda', LastName: 'Lopez', TeamID: 3, SportID: 8 }, // Basketball
    { FirstName: 'Ryan', LastName: 'Gonzalez', TeamID: 3, SportID: 9 }, // Lemon Spoon Race
  ];

  // Add sample players
  for (const player of players) {
    await ExcelService.appendToSheet<Player>('Players', player);
  }

  // Sample medal data
  const medals: Omit<Medal, 'ID'>[] = [
    // Alpha Squad medals
    { TeamID: 1, SportID: 1, Gold: 2, Silver: 1, Bronze: 0, Total: 3 }, // Foosball
    { TeamID: 1, SportID: 3, Gold: 1, Silver: 0, Bronze: 1, Total: 2 }, // Chess
    { TeamID: 1, SportID: 4, Gold: 0, Silver: 2, Bronze: 1, Total: 3 }, // Table Tennis
    
    // Beta Warriors medals
    { TeamID: 2, SportID: 2, Gold: 1, Silver: 1, Bronze: 1, Total: 3 }, // Carrom
    { TeamID: 2, SportID: 5, Gold: 2, Silver: 0, Bronze: 0, Total: 2 }, // Badminton
    { TeamID: 2, SportID: 7, Gold: 1, Silver: 1, Bronze: 0, Total: 2 }, // Football
    
    // Gamma Force medals
    { TeamID: 3, SportID: 6, Gold: 0, Silver: 1, Bronze: 2, Total: 3 }, // Cricket
    { TeamID: 3, SportID: 8, Gold: 1, Silver: 0, Bronze: 1, Total: 2 }, // Basketball
    { TeamID: 3, SportID: 9, Gold: 0, Silver: 1, Bronze: 0, Total: 1 }, // Lemon Spoon Race
  ];

  // Add sample medals
  for (const medal of medals) {
    await ExcelService.appendToSheet<Medal>('Medals', medal);
  }

  console.log('Sample data initialized successfully');
}