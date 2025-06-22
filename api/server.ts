import { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import { join } from 'path';

// In-memory storage for dynamic data (events created during session)
let dynamicData = {
  schedules: []
};

// Function to load data from JSON files
async function loadDataFromFiles() {
  try {
    const dataDir = join(process.cwd(), 'data');
    
    // Read all JSON files
    const teamsData = await fs.readFile(join(dataDir, 'sample-teams.json'), 'utf-8');
    const medalsData = await fs.readFile(join(dataDir, 'sample-medals.json'), 'utf-8');
    const sportsData = await fs.readFile(join(dataDir, 'sample-sports.json'), 'utf-8');
    
    const teams = JSON.parse(teamsData).Teams;
    const medals = JSON.parse(medalsData).Medals;
    const sports = JSON.parse(sportsData).Sports;
    
    return {
      sports,
      teams,
      medals,
      players: [], // Will need to add players.json if needed
      schedules: dynamicData.schedules // Use in-memory data for events
    };
  } catch (error) {
    console.error('Error loading data from files:', error);
    // Fallback to static data if file reading fails
    return getStaticData();
  }
}

// Fallback static data
function getStaticData() {
  return {
    sports: [
      { ID: 1, Name: "Foosball", Description: "Table football game", Icon_URL: "/Icons/foosball.svg" },
      { ID: 2, Name: "Carrom", Description: "Traditional board game", Icon_URL: "/Icons/carrom.svg" },
      { ID: 3, Name: "Chess", Description: "Strategic board game", Icon_URL: "/Icons/chess.svg" },
      { ID: 4, Name: "Table Tennis", Description: "Indoor racquet sport", Icon_URL: "/Icons/table-tennis.svg" },
      { ID: 5, Name: "Badminton", Description: "Racquet sport with shuttlecock", Icon_URL: "/Icons/badminton.svg" },
      { ID: 6, Name: "Cricket", Description: "Popular bat-and-ball game", Icon_URL: "/Icons/cricket.svg" },
      { ID: 7, Name: "Football", Description: "Most popular sport worldwide", Icon_URL: "/Icons/football.svg" },
      { ID: 8, Name: "Basketball", Description: "Fast-paced team sport", Icon_URL: "/Icons/basketball.svg" },
      { ID: 9, Name: "Lemon Spoon Race", Description: "Fun balancing race", Icon_URL: "/Icons/lemon-spoon.svg" }
    ],
    teams: [
      { ID: 1, Name: "Success Squad", Country: "USA", Logo_URL: "/images/teams/success-squad.png", Organization: "Enablement & Success", TagLine: "Game On,CustGrSnss", Color: "#000000" },
      { ID: 2, Name: "BkNdBoss", Country: "India", Logo_URL: "/images/teams/bkndboss.png", Organization: "G&A", TagLine: "Game On,BkNd Strong!", Color: "#8B4513" },
      { ID: 3, Name: "Olympus", Country: "USA", Logo_URL: "/images/teams/olympus.png", Organization: "Hosting & Security", TagLine: "Power of Gods", Color: "#800080" },
      { ID: 4, Name: "ClassIX", Country: "Canada", Logo_URL: "/images/teams/classix.png", Organization: "Classroom", TagLine: "Raw Skill, Pure Class", Color: "#FF8C00" },
      { ID: 5, Name: "KRR", Country: "UK", Logo_URL: "/images/teams/krr.png", Organization: "Compliance", TagLine: "Rise Rally Reign", Color: "#808080" },
      { ID: 6, Name: "CoreForce", Country: "Australia", Logo_URL: "/images/teams/coreforce.png", Organization: "PS SIS+", TagLine: "Unleash Our Core Power", Color: "#FF0000" },
      { ID: 7, Name: "PhoenIX", Country: "India", Logo_URL: "/images/teams/phoenix.png", Organization: "UI&DS", TagLine: "Honor, Fire, Victory", Color: "#008000" },
      { ID: 8, Name: "NUM1", Country: "USA", Logo_URL: "/images/teams/num1.png", Organization: "UT&CCLR", TagLine: "United for Success", Color: "#00CED1" },
      { ID: 9, Name: "ERP Blaze", Country: "Germany", Logo_URL: "/images/teams/erp-blaze.png", Organization: "ERP & HED R&D", TagLine: "Elevate Radiate Power", Color: "#000080" },
      { ID: 10, Name: "On Point", Country: "India", Logo_URL: "/images/teams/on-point.png", Organization: "Services", TagLine: "Swift Sharp Strong", Color: "#FFFF00" },
      { ID: 11, Name: "Warriors", Country: "USA", Logo_URL: "/images/teams/warriors.png", Organization: "Support 1", TagLine: "Built to Battle", Color: "#FF69B4" },
      { ID: 12, Name: "Knights", Country: "Canada", Logo_URL: "/images/teams/knights.png", Organization: "Support 2", TagLine: "Lead with Power", Color: "#008B8B" }
    ],
    medals: [
      { ID: 1, TeamID: 1, SportID: 1, Gold: 2, Silver: 1, Bronze: 0, Total: 3 },
      { ID: 2, TeamID: 1, SportID: 3, Gold: 1, Silver: 0, Bronze: 1, Total: 2 },
      { ID: 3, TeamID: 1, SportID: 4, Gold: 0, Silver: 2, Bronze: 1, Total: 3 },
      { ID: 4, TeamID: 2, SportID: 2, Gold: 1, Silver: 1, Bronze: 1, Total: 3 },
      { ID: 5, TeamID: 2, SportID: 5, Gold: 2, Silver: 0, Bronze: 0, Total: 2 },
      { ID: 6, TeamID: 2, SportID: 7, Gold: 1, Silver: 1, Bronze: 0, Total: 2 },
      { ID: 7, TeamID: 3, SportID: 6, Gold: 0, Silver: 1, Bronze: 2, Total: 3 },
      { ID: 8, TeamID: 3, SportID: 8, Gold: 1, Silver: 0, Bronze: 1, Total: 2 },
      { ID: 9, TeamID: 3, SportID: 9, Gold: 0, Silver: 1, Bronze: 0, Total: 1 }
    ],
    players: [],
    schedules: dynamicData.schedules
  };
}

// Helper functions for CRUD operations
let nextId = {
  sports: 10, // Next ID after the 9 existing sports
  teams: 13,  // Next ID after the 12 existing teams
  medals: 10, // Next ID after the 9 existing medals
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
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    // Load data from files
    const mockData = await loadDataFromFiles();
    
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
        console.log('Returning medals data:', mockData.medals.length, 'medals');
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
          data: dynamicData.schedules
        });
        return;
      }
      
      if (req.method === 'POST') {
        console.log('Creating new schedule/event:', req.body);
        const newEvent = {
          ID: generateId('schedules'),
          ...req.body
        };
        dynamicData.schedules.push(newEvent);
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
        const schedule = findItemById(dynamicData.schedules, id);
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
        const index = findItemIndex(dynamicData.schedules, id);
        if (index !== -1) {
          dynamicData.schedules[index] = { ...dynamicData.schedules[index], ...req.body };
          console.log('Schedule updated successfully:', dynamicData.schedules[index]);
          res.status(200).json({
            success: true,
            data: dynamicData.schedules[index],
            message: 'Schedule updated successfully'
          });
          return;
        }
      }
      
      if (req.method === 'DELETE') {
        console.log(`Deleting schedule ${id}`);
        const index = findItemIndex(dynamicData.schedules, id);
        if (index !== -1) {
          const deleted = dynamicData.schedules.splice(index, 1)[0];
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