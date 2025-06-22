const fs = require('fs');
const path = require('path');

// Helper functions for file operations
const dataPath = path.join(__dirname, 'data');
const sportsFile = path.join(dataPath, 'sample-sports.json');

function readSports() {
  try {
    if (!fs.existsSync(sportsFile)) {
      return [];
    }
    const data = fs.readFileSync(sportsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading sports file:', error);
    return [];
  }
}

function writeSports(sports) {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(sportsFile, JSON.stringify(sports, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing sports file:', error);
    return false;
  }
}

function getNextId(sports) {
  if (sports.length === 0) return 1;
  return Math.max(...sports.map(s => parseInt(s.ID) || 0)) + 1;
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
    const sports = readSports();
    const { path: requestPath, httpMethod } = event;
    
    // Extract ID from path if present
    const pathParts = requestPath.split('/');
    const id = pathParts[pathParts.length - 1];
    const sportId = !isNaN(parseInt(id)) ? parseInt(id) : null;

    switch (httpMethod) {
      case 'GET':
        if (sportId) {
          // Get single sport
          const singleSport = sports.find(s => parseInt(s.ID) === sportId);
          if (!singleSport) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Sport not found'
              })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: singleSport
            })
          };
        } else {
          // Get all sports
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: sports
            })
          };
        }

      case 'POST':
        // Create new sport
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

        const newSportData = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['Name'];
        const missingFields = requiredFields.filter(field => !newSportData[field]);
        
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

        // Check if sport name already exists
        const existingSport = sports.find(s => 
          s.Name.toLowerCase() === newSportData.Name.toLowerCase()
        );
        
        if (existingSport) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Sport name already exists'
            })
          };
        }

        // Create new sport with auto-generated ID
        const newSport = {
          ID: getNextId(sports),
          Name: newSportData.Name.trim(),
          Description: newSportData.Description || '',
          Rules: newSportData.Rules || '',
          Icon: newSportData.Icon || `/Icons/${newSportData.Name.toLowerCase().replace(/\s+/g, '-')}.svg`,
          TeamSize: newSportData.TeamSize || 1,
          Duration: newSportData.Duration || '',
          Venue: newSportData.Venue || '',
          Equipment: newSportData.Equipment || []
        };

        sports.push(newSport);
        
        if (!writeSports(sports)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save sport'
            })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: newSport
          })
        };

      case 'PUT':
        // Update existing sport
        if (!sportId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Sport ID is required for update'
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
        const sportIndex = sports.findIndex(s => parseInt(s.ID) === sportId);
        
        if (sportIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Sport not found'
            })
          };
        }

        // Check if updated name conflicts with existing sport
        if (updateData.Name) {
          const conflictingSport = sports.find(s => 
            parseInt(s.ID) !== sportId && 
            s.Name.toLowerCase() === updateData.Name.toLowerCase()
          );
          
          if (conflictingSport) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Sport name already exists'
              })
            };
          }
        }

        // Update sport with provided data
        const updatedSport = {
          ...sports[sportIndex],
          ...updateData,
          ID: sportId, // Ensure ID doesn't change
          Name: updateData.Name ? updateData.Name.trim() : sports[sportIndex].Name,
          TeamSize: updateData.TeamSize ? parseInt(updateData.TeamSize) : sports[sportIndex].TeamSize
        };

        sports[sportIndex] = updatedSport;

        if (!writeSports(sports)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save updated sport'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: updatedSport
          })
        };

      case 'DELETE':
        // Delete sport
        if (!sportId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Sport ID is required for deletion'
            })
          };
        }

        const deleteIndex = sports.findIndex(s => parseInt(s.ID) === sportId);
        
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Sport not found'
            })
          };
        }

        const deletedSport = sports.splice(deleteIndex, 1)[0];

        if (!writeSports(sports)) {
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
            data: deletedSport
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
    console.error('Sports function error:', error);
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