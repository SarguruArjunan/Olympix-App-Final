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

function writeEvents(events) {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing events file:', error);
    return false;
  }
}

function getNextId(events) {
  if (events.length === 0) return 1;
  return Math.max(...events.map(e => parseInt(e.ID) || 0)) + 1;
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
    const events = readEvents();
    const { path: requestPath, httpMethod } = event;
    
    // Extract ID from path if present (e.g., /123 from /.netlify/functions/events/123)
    const pathParts = requestPath.split('/');
    const id = pathParts[pathParts.length - 1];
    const eventId = !isNaN(parseInt(id)) ? parseInt(id) : null;

    switch (httpMethod) {
      case 'GET':
        if (eventId) {
          // Get single event
          const singleEvent = events.find(e => parseInt(e.ID) === eventId);
          if (!singleEvent) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Event not found'
              })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: singleEvent
            })
          };
        } else {
          // Get all events or filtered by sport/team
          let filteredEvents = events;
          
          // Handle query parameters for filtering
          const queryParams = event.queryStringParameters || {};
          
          if (queryParams.sport) {
            const sportId = parseInt(queryParams.sport);
            filteredEvents = events.filter(e => parseInt(e.Sport_ID) === sportId);
          }
          
          if (queryParams.team) {
            const teamId = parseInt(queryParams.team);
            filteredEvents = events.filter(e => 
              parseInt(e.Team1_ID) === teamId || parseInt(e.Team2_ID) === teamId
            );
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: filteredEvents
            })
          };
        }

      case 'POST':
        // Create new event
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

        const newEventData = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['Sport_ID', 'Team1_ID', 'Team2_ID', 'DateTime', 'Venue'];
        const missingFields = requiredFields.filter(field => !newEventData[field]);
        
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

        // Create new event with auto-generated ID
        const newEvent = {
          ID: getNextId(events),
          Sport_ID: parseInt(newEventData.Sport_ID),
          Team1_ID: parseInt(newEventData.Team1_ID),
          Team2_ID: parseInt(newEventData.Team2_ID),
          DateTime: newEventData.DateTime,
          Venue: newEventData.Venue,
          Status: newEventData.Status || 'Scheduled',
          Team1_Score: newEventData.Team1_Score || null,
          Team2_Score: newEventData.Team2_Score || null,
          Winner_Team_ID: newEventData.Winner_Team_ID || null
        };

        events.push(newEvent);
        
        if (!writeEvents(events)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save event'
            })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: newEvent
          })
        };

      case 'PUT':
        // Update existing event
        if (!eventId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Event ID is required for update'
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
        const eventIndex = events.findIndex(e => parseInt(e.ID) === eventId);
        
        if (eventIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Event not found'
            })
          };
        }

        // Update event with provided data
        const updatedEvent = {
          ...events[eventIndex],
          ...updateData,
          ID: eventId // Ensure ID doesn't change
        };

        events[eventIndex] = updatedEvent;

        if (!writeEvents(events)) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Failed to save updated event'
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: updatedEvent
          })
        };

      case 'DELETE':
        // Delete event
        if (!eventId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Event ID is required for deletion'
            })
          };
        }

        const deleteIndex = events.findIndex(e => parseInt(e.ID) === eventId);
        
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Event not found'
            })
          };
        }

        const deletedEvent = events.splice(deleteIndex, 1)[0];

        if (!writeEvents(events)) {
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
            data: deletedEvent
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
    console.error('Events function error:', error);
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