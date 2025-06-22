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
    
    // Extract sport ID from path - handle both /sport/ID and /ID patterns
    const { path: requestPath } = event;
    const pathParts = requestPath.split('/');
    let sportId = null;
    
    // Find the sport ID in the path
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] === 'sport' && i + 1 < pathParts.length) {
        sportId = parseInt(pathParts[i + 1]);
        break;
      }
      // Also check if the last part is a number (fallback)
      if (i === pathParts.length - 1 && !isNaN(parseInt(pathParts[i]))) {
        sportId = parseInt(pathParts[i]);
      }
    }

    if (!sportId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Sport ID is required'
        })
      };
    }

    // Filter events by sport ID - handle both Sport_ID and SportID field names
    const sportEvents = events.filter(event => {
      const eventSportId = event.Sport_ID || event.SportID;
      return parseInt(eventSportId) === sportId;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: sportEvents
      })
    };
  } catch (error) {
    console.error('Schedules-sport function error:', error);
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