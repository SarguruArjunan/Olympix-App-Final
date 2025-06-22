const fs = require('fs');
const path = require('path');

// Helper functions for file operations
const dataPath = path.join(__dirname, 'data');
const medalsFile = path.join(dataPath, 'sample-medals.json');

function readMedals() {
  try {
    if (!fs.existsSync(medalsFile)) {
      return [];
    }
    const data = fs.readFileSync(medalsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading medals file:', error);
    return [];
  }
}

function writeMedals(medals) {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(medalsFile, JSON.stringify(medals, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing medals file:', error);
    return false;
  }
}

function getNextId(medals) {
  if (medals.length === 0) return 1;
  return Math.max(...medals.map(m => parseInt(m.ID) || 0)) + 1;
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
    const medals = readMedals();
    const { path: requestPath, httpMethod } = event;
    
    // Extract ID from path if present
    const pathParts = requestPath.split('/');
    const id = pathParts[pathParts.length - 1];
    const medalId = !isNaN(parseInt(id)) ? parseInt(id) : null;

    switch (httpMethod) {
      case 'GET':
        if (medalId) {
          // Get single medal
          const singleMedal = medals.find(m => parseInt(m.ID) === medalId);
          if (!singleMedal) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Medal not found'
              })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: singleMedal
            })
          };
        } else {
          // Get all medals or filtered by team/sport
          let filteredMedals = medals;
          
          // Handle query parameters for filtering
          const queryParams = event.queryStringParameters || {};
          
          if (queryParams.team) {
            const teamId = parseInt(queryParams.team);
            filteredMedals = medals.filter(m => parseInt(m.Team_ID) === teamId);
          }
          
          if (queryParams.sport) {
            const sportId = parseInt(queryParams.sport);
            filteredMedals = medals.filter(m => parseInt(m.Sport_ID) === sportId);
          }
          
          if (queryParams.type) {
            filteredMedals = filteredMedals.filter(m => 
              m.Medal_Type.toLowerCase() === queryParams.type.toLowerCase()
            );
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: filteredMedals
            })
          };
        }

      case 'POST':
        // Create new medal
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

        const newMedalData = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['Team_ID', 'Sport_ID', 'Medal_Type'];
        const missingFields = requiredFields.filter(field => !newMedalData[field]);
        
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

        // Validate medal type
        const validMedalTypes = ['GOLD', 'SILVER', 'BRONZE'];
        if (!validMedalTypes.includes(newMedalData.Medal_Type.toUpperCase())) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Invalid medal type. Must be GOLD, SILVER, or BRONZE'
            })
          };
        }

        // Create new medal with auto-generated ID
        const newMedal = {
          ID: getNextId(medals),
          Team_ID: parseInt(newMedalData.Team_ID),
          Sport_ID: parseInt(newMedalData.Sport_ID),
          Medal_Type: newMedalData.Medal_Type.toUpperCase(),
          Event_Name: newMedalData.Event_Name || '',
          Player_Name: newMedalData.Player_Name || '',
          Date: newMedalData.Date || new Date().toISOString().split('T')[0],
          Notes: newMedalData.Notes || ''
        };

        medals.push(newMedal);
        
        if (!writeMedals(medals)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save medal'
            })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: newMedal
          })
        };

      case 'PUT':
        // Update existing medal
        if (!medalId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Medal ID is required for update'
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
        const medalIndex = medals.findIndex(m => parseInt(m.ID) === medalId);
        
        if (medalIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Medal not found'
            })
          };
        }

        // Validate medal type if provided
        if (updateData.Medal_Type) {
          const validMedalTypes = ['GOLD', 'SILVER', 'BRONZE'];
          if (!validMedalTypes.includes(updateData.Medal_Type.toUpperCase())) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Invalid medal type. Must be GOLD, SILVER, or BRONZE'
              })
            };
          }
          updateData.Medal_Type = updateData.Medal_Type.toUpperCase();
        }

        // Update medal with provided data
        const updatedMedal = {
          ...medals[medalIndex],
          ...updateData,
          ID: medalId, // Ensure ID doesn't change
          Team_ID: updateData.Team_ID ? parseInt(updateData.Team_ID) : medals[medalIndex].Team_ID,
          Sport_ID: updateData.Sport_ID ? parseInt(updateData.Sport_ID) : medals[medalIndex].Sport_ID
        };

        medals[medalIndex] = updatedMedal;

        if (!writeMedals(medals)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save updated medal'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: updatedMedal
          })
        };

      case 'DELETE':
        // Delete medal
        if (!medalId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Medal ID is required for deletion'
            })
          };
        }

        const deleteIndex = medals.findIndex(m => parseInt(m.ID) === medalId);
        
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Medal not found'
            })
          };
        }

        const deletedMedal = medals.splice(deleteIndex, 1)[0];

        if (!writeMedals(medals)) {
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
            data: deletedMedal
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
    console.error('Medals function error:', error);
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