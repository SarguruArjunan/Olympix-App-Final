import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock API data
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

// Production API with proper routing
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path || '';

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
      res.status(200).json({
        success: true,
        data: mockData.sports
      });
      return;
    }

    if (pathStr === 'teams') {
      res.status(200).json({
        success: true,
        data: mockData.teams
      });
      return;
    }

    if (pathStr === 'medals') {
      res.status(200).json({
        success: true,
        data: mockData.medals
      });
      return;
    }

    if (pathStr === 'players') {
      res.status(200).json({
        success: true,
        data: mockData.players
      });
      return;
    }

    if (pathStr === 'schedules') {
      res.status(200).json({
        success: true,
        data: mockData.schedules
      });
      return;
    }

    // Individual resource routes
    if (pathStr.startsWith('sports/')) {
      const id = parseInt(pathStr.split('/')[1]);
      const sport = mockData.sports.find(s => s.ID === id);
      if (sport) {
        res.status(200).json({
          success: true,
          data: sport
        });
        return;
      }
    }

    if (pathStr.startsWith('teams/')) {
      const id = parseInt(pathStr.split('/')[1]);
      const team = mockData.teams.find(t => t.ID === id);
      if (team) {
        res.status(200).json({
          success: true,
          data: team
        });
        return;
      }
    }

    // Default response for unknown routes
    res.status(200).json({
      success: true,
      message: `Route not implemented: ${pathStr}`,
      availableRoutes: ['health', 'sports', 'teams', 'medals', 'players', 'schedules'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}