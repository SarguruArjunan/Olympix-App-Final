const fs = require('fs');
const path = require('path');

// Helper functions for file operations
const dataPath = path.join(__dirname, 'data');
const teamsFile = path.join(dataPath, 'sample-teams.json');

function readTeams() {
  try {
    if (!fs.existsSync(teamsFile)) {
      return [];
    }
    const data = fs.readFileSync(teamsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading teams file:', error);
    return [];
  }
}

function writeTeams(teams) {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(teamsFile, JSON.stringify(teams, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing teams file:', error);
    return false;
  }
}

function getNextId(teams) {
  if (teams.length === 0) return 1;
  return Math.max(...teams.map(t => parseInt(t.ID) || 0)) + 1;
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
    const teams = readTeams();
    const { path: requestPath, httpMethod } = event;
    
    // Extract ID from path if present
    const pathParts = requestPath.split('/');
    const id = pathParts[pathParts.length - 1];
    const teamId = !isNaN(parseInt(id)) ? parseInt(id) : null;

    switch (httpMethod) {
      case 'GET':
        if (teamId) {
          // Get single team
          const singleTeam = teams.find(t => parseInt(t.ID) === teamId);
          if (!singleTeam) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Team not found'
              })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: singleTeam
            })
          };
        } else {
          // Get all teams
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: teams
            })
          };
        }

      case 'POST':
        // Create new team
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

        const newTeamData = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['Name'];
        const missingFields = requiredFields.filter(field => !newTeamData[field]);
        
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

        // Check if team name already exists
        const existingTeam = teams.find(t => 
          t.Name.toLowerCase() === newTeamData.Name.toLowerCase()
        );
        
        if (existingTeam) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Team name already exists'
            })
          };
        }

        // Create new team with auto-generated ID
        const newTeam = {
          ID: getNextId(teams),
          Name: newTeamData.Name,
          Logo: newTeamData.Logo || `/images/teams/${newTeamData.Name.toLowerCase().replace(/\s+/g, '-')}.png`,
          Captain: newTeamData.Captain || '',
          Members: newTeamData.Members || []
        };

        teams.push(newTeam);
        
        if (!writeTeams(teams)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save team'
            })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: newTeam
          })
        };

      case 'PUT':
        // Update existing team
        if (!teamId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Team ID is required for update'
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
        const teamIndex = teams.findIndex(t => parseInt(t.ID) === teamId);
        
        if (teamIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Team not found'
            })
          };
        }

        // Check if updated name conflicts with existing team
        if (updateData.Name) {
          const conflictingTeam = teams.find(t => 
            parseInt(t.ID) !== teamId && 
            t.Name.toLowerCase() === updateData.Name.toLowerCase()
          );
          
          if (conflictingTeam) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Team name already exists'
              })
            };
          }
        }

        // Update team with provided data
        const updatedTeam = {
          ...teams[teamIndex],
          ...updateData,
          ID: teamId // Ensure ID doesn't change
        };

        teams[teamIndex] = updatedTeam;

        if (!writeTeams(teams)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save updated team'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: updatedTeam
          })
        };

      case 'DELETE':
        // Delete team
        if (!teamId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Team ID is required for deletion'
            })
          };
        }

        const deleteIndex = teams.findIndex(t => parseInt(t.ID) === teamId);
        
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Team not found'
            })
          };
        }

        const deletedTeam = teams.splice(deleteIndex, 1)[0];

        if (!writeTeams(teams)) {
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
            data: deletedTeam
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
    console.error('Teams function error:', error);
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