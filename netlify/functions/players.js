const fs = require('fs');
const path = require('path');

// Helper functions for file operations
const dataPath = path.join(__dirname, 'data');
const playersFile = path.join(dataPath, 'sample-players.json');

function readPlayers() {
  try {
    if (!fs.existsSync(playersFile)) {
      return [];
    }
    const data = fs.readFileSync(playersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading players file:', error);
    return [];
  }
}

function writePlayers(players) {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing players file:', error);
    return false;
  }
}

function getNextId(players) {
  if (players.length === 0) return 1;
  return Math.max(...players.map(p => parseInt(p.ID) || 0)) + 1;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  try {
    const players = readPlayers();
    const { path: requestPath, httpMethod } = event;
    
    // Extract ID from path if present
    const pathParts = requestPath.split('/');
    const id = pathParts[pathParts.length - 1];
    const playerId = !isNaN(parseInt(id)) ? parseInt(id) : null;

    switch (httpMethod) {
      case 'GET':
        if (playerId) {
          // Get single player
          const singlePlayer = players.find(p => parseInt(p.ID) === playerId);
          if (!singlePlayer) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Player not found'
              })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: singlePlayer
            })
          };
        } else {
          // Get all players or filtered by team
          let filteredPlayers = players;
          
          // Handle query parameters for filtering
          const queryParams = event.queryStringParameters || {};
          
          if (queryParams.team) {
            const teamId = parseInt(queryParams.team);
            filteredPlayers = players.filter(p => parseInt(p.Team_ID) === teamId);
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: filteredPlayers
            })
          };
        }

      case 'POST':
        // Create new player
        if (!event.body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Request body is required'
            })
          };
        }

        const newPlayerData = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['Name', 'Team_ID'];
        const missingFields = requiredFields.filter(field => !newPlayerData[field]);
        
        if (missingFields.length > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: `Missing required fields: ${missingFields.join(', ')}`
            })
          };
        }

        // Create new player with auto-generated ID
        const newPlayer = {
          ID: getNextId(players),
          Name: newPlayerData.Name.trim(),
          Team_ID: parseInt(newPlayerData.Team_ID),
          Position: newPlayerData.Position || '',
          Age: newPlayerData.Age ? parseInt(newPlayerData.Age) : null,
          Experience: newPlayerData.Experience || '',
          Achievements: newPlayerData.Achievements || [],
          Sports: newPlayerData.Sports || [],
          Photo: newPlayerData.Photo || null
        };

        players.push(newPlayer);
        
        if (!writePlayers(players)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save player'
            })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: newPlayer
          })
        };

      case 'PUT':
        // Update existing player
        if (!playerId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Player ID is required for update'
            })
          };
        }

        if (!event.body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Request body is required'
            })
          };
        }

        const updateData = JSON.parse(event.body);
        const playerIndex = players.findIndex(p => parseInt(p.ID) === playerId);
        
        if (playerIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Player not found'
            })
          };
        }

        // Update player with provided data
        const updatedPlayer = {
          ...players[playerIndex],
          ...updateData,
          ID: playerId, // Ensure ID doesn't change
          Name: updateData.Name ? updateData.Name.trim() : players[playerIndex].Name,
          Team_ID: updateData.Team_ID ? parseInt(updateData.Team_ID) : players[playerIndex].Team_ID,
          Age: updateData.Age ? parseInt(updateData.Age) : players[playerIndex].Age
        };

        players[playerIndex] = updatedPlayer;

        if (!writePlayers(players)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save updated player'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: updatedPlayer
          })
        };

      case 'DELETE':
        // Delete player
        if (!playerId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Player ID is required for deletion'
            })
          };
        }

        const deleteIndex = players.findIndex(p => parseInt(p.ID) === playerId);
        
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Player not found'
            })
          };
        }

        const deletedPlayer = players.splice(deleteIndex, 1)[0];

        if (!writePlayers(players)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save after deletion'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: deletedPlayer
          })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({
            success: false,
            error: `Method ${httpMethod} not allowed`
          })
        };
    }
  } catch (error) {
    console.error('Players function error:', error);
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