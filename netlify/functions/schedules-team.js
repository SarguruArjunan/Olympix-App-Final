const fs = require('fs');
const path = require('path');

// Helper functions for file operations
const dataPath = path.join(__dirname, 'data');
const eventsFile = path.join(dataPath, 'sample-events.json');

function readEvents() {
  try {
    if (!fs.existsSync(eventsFile)) {
      return [];
    }
    const data = fs.readFileSync(eventsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading events file:', error);
    return [];
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    const events = readEvents();
    
    // Extract team ID from path - handle both /team/ID and /ID patterns
    const { path: requestPath } = event;
    const pathParts = requestPath.split('/');
    let teamId = null;
    
    // Find the team ID in the path
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] === 'team' && i + 1 < pathParts.length) {
        teamId = parseInt(pathParts[i + 1]);
        break;
      }
      // Also check if the last part is a number (fallback)
      if (i === pathParts.length - 1 && !isNaN(parseInt(pathParts[i]))) {
        teamId = parseInt(pathParts[i]);
      }
    }

    if (!teamId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Team ID is required'
        })
      };
    }

    // Filter events by team ID - handle multiple field name variations
    const teamEvents = events.filter(event => {
      const team1Id = event.Team1_ID || event.TeamA_ID;
      const team2Id = event.Team2_ID || event.TeamB_ID;
      
      return parseInt(team1Id) === teamId || parseInt(team2Id) === teamId;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: teamEvents
      })
    };
  } catch (error) {
    console.error('Schedules-team function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};