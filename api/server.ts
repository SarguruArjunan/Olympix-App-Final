import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock API data with in-memory storage
const mockData = {
  sports: [
    { ID: 1, Name: "Basketball", Description: "Fast-paced team sport", Icon_URL: "/Icons/basketball.svg" },
    { ID: 2, Name: "Cricket", Description: "Popular bat-and-ball game", Icon_URL: "/Icons/cricket.svg" },
    { ID: 3, Name: "Chess", Description: "Strategic board game", Icon_URL: "/Icons/chess.svg" },
    { ID: 4, Name: "Badminton", Description: "Racquet sport with shuttlecock", Icon_URL: "/Icons/badminton.svg" },
    { ID: 5, Name: "Table Tennis", Description: "Indoor racquet sport", Icon_URL: "/Icons/table-tennis.svg" },
    { ID: 6, Name: "Football", Description: "Most popular sport worldwide", Icon_URL: "/Icons/football.svg" },
    { ID: 7, Name: "Carrom", Description: "Traditional board game", Icon_URL: "/Icons/carrom.svg" },
    { ID: 8, Name: "Foosball", Description: "Table football game", Icon_URL: "/Icons/foosball.svg" }
  ],
  teams: [
    { ID: 1, Name: "Classix Champions", Country: "India", Logo_URL: "/images/teams/classix.png", Organization: "PowerSchool", TagLine: "Excellence in Competition", Color: "#FF6B6B" },
    { ID: 2, Name: "Thunder Bolts", Country: "India", Logo_URL: "/images/teams/thunder.png", Organization: "PowerSchool", TagLine: "Strike Like Lightning", Color: "#4ECDC4" },
    { ID: 3, Name: "Fire Hawks", Country: "India", Logo_URL: "/images/teams/fire-hawks.png", Organization: "PowerSchool", TagLine: "Soaring to Victory", Color: "#FF9F43" },
    { ID: 4, Name: "Ocean Warriors", Country: "India", Logo_URL: "/images/teams/ocean-warriors.png", Organization: "PowerSchool", TagLine: "Riding the Waves", Color: "#3742FA" },
    { ID: 5, Name: "Green Guardians", Country: "India", Logo_URL: "/images/teams/green-guardians.png", Organization: "PowerSchool", TagLine: "Protecting Our Future", Color: "#2ED573" },
    { ID: 6, Name: "Golden Eagles", Country: "India", Logo_URL: "/images/teams/golden-eagles.png", Organization: "PowerSchool", TagLine: "Flying High", Color: "#FFA726" }
  ],
  medals: [],
  players: [],
  schedules: []
};

// Helper functions for CRUD operations
let nextId = {
  sports: 9,
  teams: 7,
  medals: 1,
  players: 1,
  schedules: 1
};

function generateId(type: keyof typeof nextId): number {
  return nextId[type]++;
}

function findItemById(collection: any[], id: number) {
  return collection.find(item => item.ID === id);
}

function findItemIndex(collection: any[], id: number) {
  return collection.findIndex(item => item.ID === id);
}

// Production API with proper routing
export default function handler(req: VercelRequest, res: VercelResponse) {
  // DEBUGGING: Log all incoming requests
  console.log('=== API REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  console.log('========================');

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request - responding with 200');
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path || '';
  
  console.log('Processed path:', pathStr);
  console.log('Request method:', req.method);

  try {
    // Route handling
    if (pathStr === 'health' || pathStr === '') {
      res.status(200).json({
        success: true,
        message: 'API is running successfully',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'production'
      });
      return;
    }

    if (pathStr === 'sports') {
      if (req.method === 'GET') {
        res.status(200).json({
          success: true,
          data: mockData.sports
        });
        return;
      }
      
      if (req.method === 'POST') {
        console.log('Creating new sport:', req.body);
        const newSport = {
          ID: generateId('sports'),
          ...req.body
        };
        mockData.sports.push(newSport);
        res.status(201).json({
          success: true,
          data: newSport,
          message: 'Sport created successfully'
        });
        return;
      }
    }

    if (pathStr === 'teams') {
      if (req.method === 'GET') {
        res.status(200).json({
          success: true,
          data: mockData.teams
        });
        return;
      }
      
      if (req.method === 'POST') {
        console.log('Creating new team:', req.body);
        const newTeam = {
          ID: generateId('teams'),
          ...req.body
        };
        mockData.teams.push(newTeam);
        res.status(201).json({
          success: true,
          data: newTeam,
          message: 'Team created successfully'
        });
        return;
      }
    }

    if (pathStr === 'medals') {
      if (req.method === 'GET') {
        res.status(200).json({
          success: true,
          data: mockData.medals
        });
        return;
      }
      
      if (req.method === 'POST') {
        console.log('Creating new medal:', req.body);
        const newMedal = {
          ID: generateId('medals'),
          ...req.body
        };
        mockData.medals.push(newMedal);
        res.status(201).json({
          success: true,
          data: newMedal,
          message: 'Medal created successfully'
        });
        return;
      }
    }

    if (pathStr === 'players') {
      if (req.method === 'GET') {
        res.status(200).json({
          success: true,
          data: mockData.players
        });
        return;
      }
      
      if (req.method === 'POST') {
        console.log('Creating new player:', req.body);
        const newPlayer = {
          ID: generateId('players'),
          ...req.body
        };
        mockData.players.push(newPlayer);
        res.status(201).json({
          success: true,
          data: newPlayer,
          message: 'Player created successfully'
        });
        return;
      }
    }

    if (pathStr === 'schedules') {
      if (req.method === 'GET') {
        res.status(200).json({
          success: true,
          data: mockData.schedules
        });
        return;
      }
      
      if (req.method === 'POST') {
        console.log('Creating new schedule/event:', req.body);
        const newEvent = {
          ID: generateId('schedules'),
          ...req.body
        };
        mockData.schedules.push(newEvent);
        console.log('Event created successfully:', newEvent);
        res.status(201).json({
          success: true,
          data: newEvent,
          message: 'Event created successfully'
        });
        return;
      }
    }

    // Individual resource routes
    if (pathStr.startsWith('sports/')) {
      const id = parseInt(pathStr.split('/')[1]);
      
      if (req.method === 'GET') {
        const sport = findItemById(mockData.sports, id);
        if (sport) {
          res.status(200).json({
            success: true,
            data: sport
          });
          return;
        }
      }
      
      if (req.method === 'PUT') {
        const index = findItemIndex(mockData.sports, id);
        if (index !== -1) {
          mockData.sports[index] = { ...mockData.sports[index], ...req.body };
          res.status(200).json({
            success: true,
            data: mockData.sports[index],
            message: 'Sport updated successfully'
          });
          return;
        }
      }
      
      if (req.method === 'DELETE') {
        const index = findItemIndex(mockData.sports, id);
        if (index !== -1) {
          mockData.sports.splice(index, 1);
          res.status(200).json({
            success: true,
            message: 'Sport deleted successfully'
          });
          return;
        }
      }
    }

    if (pathStr.startsWith('teams/')) {
      const id = parseInt(pathStr.split('/')[1]);
      
      if (req.method === 'GET') {
        const team = findItemById(mockData.teams, id);
        if (team) {
          res.status(200).json({
            success: true,
            data: team
          });
          return;
        }
      }
      
      if (req.method === 'PUT') {
        const index = findItemIndex(mockData.teams, id);
        if (index !== -1) {
          mockData.teams[index] = { ...mockData.teams[index], ...req.body };
          res.status(200).json({
            success: true,
            data: mockData.teams[index],
            message: 'Team updated successfully'
          });
          return;
        }
      }
      
      if (req.method === 'DELETE') {
        const index = findItemIndex(mockData.teams, id);
        if (index !== -1) {
          mockData.teams.splice(index, 1);
          res.status(200).json({
            success: true,
            message: 'Team deleted successfully'
          });
          return;
        }
      }
    }

    // Handle individual medals routes (medals/:id)
    if (pathStr.startsWith('medals/')) {
      const id = parseInt(pathStr.split('/')[1]);
      
      if (req.method === 'GET') {
        const medal = findItemById(mockData.medals, id);
        if (medal) {
          res.status(200).json({
            success: true,
            data: medal
          });
          return;
        }
      }
      
      if (req.method === 'PUT') {
        const index = findItemIndex(mockData.medals, id);
        if (index !== -1) {
          mockData.medals[index] = { ...mockData.medals[index], ...req.body };
          res.status(200).json({
            success: true,
            data: mockData.medals[index],
            message: 'Medal updated successfully'
          });
          return;
        }
      }
      
      if (req.method === 'DELETE') {
        const index = findItemIndex(mockData.medals, id);
        if (index !== -1) {
          mockData.medals.splice(index, 1);
          res.status(200).json({
            success: true,
            message: 'Medal deleted successfully'
          });
          return;
        }
      }
    }

    // Handle individual players routes (players/:id)
    if (pathStr.startsWith('players/')) {
      const id = parseInt(pathStr.split('/')[1]);
      
      if (req.method === 'GET') {
        const player = findItemById(mockData.players, id);
        if (player) {
          res.status(200).json({
            success: true,
            data: player
          });
          return;
        }
      }
      
      if (req.method === 'PUT') {
        const index = findItemIndex(mockData.players, id);
        if (index !== -1) {
          mockData.players[index] = { ...mockData.players[index], ...req.body };
          res.status(200).json({
            success: true,
            data: mockData.players[index],
            message: 'Player updated successfully'
          });
          return;
        }
      }
      
      if (req.method === 'DELETE') {
        const index = findItemIndex(mockData.players, id);
        if (index !== -1) {
          mockData.players.splice(index, 1);
          res.status(200).json({
            success: true,
            message: 'Player deleted successfully'
          });
          return;
        }
      }
    }

    // Handle individual schedule routes (schedules/:id)
    if (pathStr.startsWith('schedules/')) {
      const id = parseInt(pathStr.split('/')[1]);
      
      if (req.method === 'GET') {
        const schedule = findItemById(mockData.schedules, id);
        if (schedule) {
          res.status(200).json({
            success: true,
            data: schedule
          });
          return;
        }
      }
      
      if (req.method === 'PUT') {
        console.log(`Updating schedule ${id}:`, req.body);
        const index = findItemIndex(mockData.schedules, id);
        if (index !== -1) {
          mockData.schedules[index] = { ...mockData.schedules[index], ...req.body };
          console.log('Schedule updated successfully:', mockData.schedules[index]);
          res.status(200).json({
            success: true,
            data: mockData.schedules[index],
            message: 'Schedule updated successfully'
          });
          return;
        }
      }
      
      if (req.method === 'DELETE') {
        console.log(`Deleting schedule ${id}`);
        const index = findItemIndex(mockData.schedules, id);
        if (index !== -1) {
          const deleted = mockData.schedules.splice(index, 1)[0];
          console.log('Schedule deleted successfully:', deleted);
          res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
          });
          return;
        }
      }
    }

    // Default response for unknown routes
    console.log(`ROUTE NOT FOUND: ${req.method} ${pathStr}`);
    console.log('Available routes:', ['health', 'sports', 'teams', 'medals', 'players', 'schedules']);
    
    res.status(200).json({
      success: true,
      message: `Route not implemented: ${req.method} ${pathStr}`,
      availableRoutes: ['health', 'sports', 'teams', 'medals', 'players', 'schedules'],
      requestMethod: req.method,
      requestPath: pathStr,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}