# PS-Olympics API Design Documentation

## Base URL

```
https://api.ps-olympics.com/v1
```

## Authentication

All API requests require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Status code 429 returned when exceeded

## Common Response Formats

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional info
  }
}
```

## REST Endpoints

### Sports

#### GET /sports

List all sports with basic information.

```http
GET /sports?page=1&limit=20
```

Response:

```json
{
  "status": "success",
  "data": {
    "sports": [
      {
        "id": 1,
        "name": "Foosball",
        "description": "Indoor table football game",
        "icon_url": "/images/sports/foosball.png",
        "type": "TEAM",
        "max_players_per_team": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 9
    }
  }
}
```

#### GET /sports/:id

Get detailed information about a specific sport.

```http
GET /sports/1
```

Response:

```json
{
  "status": "success",
  "data": {
    "sport": {
      "id": 1,
      "name": "Foosball",
      "description": "Indoor table football game",
      "icon_url": "/images/sports/foosball.png",
      "type": "TEAM",
      "max_players_per_team": 2,
      "scoring_type": "GOALS",
      "current_tournaments": [
        {
          "id": 1,
          "name": "Foosball Championship 2025",
          "status": "IN_PROGRESS"
        }
      ]
    }
  }
}
```

### Tournaments

#### GET /tournaments

List all tournaments with filtering options.

```http
GET /tournaments?sport_id=1&status=IN_PROGRESS
```

Response:

```json
{
  "status": "success",
  "data": {
    "tournaments": [
      {
        "id": 1,
        "sport_id": 1,
        "name": "Foosball Championship 2025",
        "format": "KNOCKOUT",
        "start_date": "2025-06-01",
        "end_date": "2025-06-07",
        "status": "IN_PROGRESS"
      }
    ]
  }
}
```

#### POST /tournaments/:id/matches

Create a new match in a tournament.

```http
POST /tournaments/1/matches
```

Request:

```json
{
  "team_ids": [1, 2],
  "venue": "Main Arena",
  "start_time": "2025-06-07T15:00:00Z",
  "round": "QUARTER_FINAL"
}
```

### Matches

#### GET /matches

List matches with comprehensive filtering.

```http
GET /matches?date=2025-06-07&sport_id=1&status=SCHEDULED
```

Response:

```json
{
  "status": "success",
  "data": {
    "matches": [
      {
        "id": 1,
        "tournament": {
          "id": 1,
          "name": "Foosball Championship 2025"
        },
        "teams": [
          {
            "id": 1,
            "name": "Team Alpha"
          },
          {
            "id": 2,
            "name": "Team Beta"
          }
        ],
        "venue": "Main Arena",
        "start_time": "2025-06-07T15:00:00Z",
        "status": "SCHEDULED",
        "round": "QUARTER_FINAL"
      }
    ]
  }
}
```

#### PATCH /matches/:id/score

Update match score (authenticated as official).

```http
PATCH /matches/1/score
```

Request:

```json
{
  "team_scores": {
    "1": 3,
    "2": 1
  },
  "status": "IN_PROGRESS"
}
```

### Teams

#### GET /teams/medals

Get medal standings.

```http
GET /teams/medals
```

Response:

```json
{
  "status": "success",
  "data": {
    "standings": [
      {
        "team": {
          "id": 1,
          "name": "Team Alpha",
          "country": "India"
        },
        "medals": {
          "gold": 3,
          "silver": 2,
          "bronze": 1
        },
        "total_points": 13
      }
    ]
  }
}
```

### Athletes

#### GET /athletes

List athletes with filtering options.

```http
GET /athletes?team_id=1&sport_id=1
```

Response:

```json
{
  "status": "success",
  "data": {
    "athletes": [
      {
        "id": 1,
        "name": "John Doe",
        "team_id": 1,
        "photo_url": "/images/athletes/john-doe.jpg",
        "sports": ["Foosball", "Table Tennis"]
      }
    ]
  }
}
```

## WebSocket Endpoints

### Real-time Score Updates

```
ws://api.ps-olympics.com/v1/live-scores
```

Connection payload:

```json
{
  "subscribe_to": ["match:1", "tournament:1"]
}
```

Update event format:

```json
{
  "event": "score_update",
  "match_id": 1,
  "data": {
    "team_scores": {
      "1": 3,
      "2": 1
    },
    "timestamp": "2025-06-07T15:30:00Z"
  }
}
```

### Medal Table Updates

```
ws://api.ps-olympics.com/v1/medal-updates
```

Update event format:

```json
{
  "event": "medal_update",
  "team_id": 1,
  "data": {
    "medal_type": "GOLD",
    "new_count": 4,
    "sport": "Foosball",
    "timestamp": "2025-06-07T15:30:00Z"
  }
}
```

## Sport-Specific Endpoints

### Cricket

#### GET /matches/:id/cricket-scorecard

Get detailed cricket match scorecard.

```http
GET /matches/1/cricket-scorecard
```

Response:

```json
{
  "status": "success",
  "data": {
    "match_id": 1,
    "innings": [
      {
        "team_id": 1,
        "runs": 150,
        "wickets": 8,
        "overs": 20.0,
        "extras": 12
      }
    ]
  }
}
```

### Chess

#### GET /matches/:id/chess-moves

Get chess match moves.

```http
GET /matches/1/chess-moves
```

Response:

```json
{
  "status": "success",
  "data": {
    "match_id": 1,
    "moves": [
      {
        "notation": "e4",
        "timestamp": "2025-06-07T15:00:00Z"
      }
    ]
  }
}
```

## Error Codes

```
AUTH_001: Invalid authentication token
AUTH_002: Token expired
AUTH_003: Insufficient permissions

REQ_001: Invalid request parameters
REQ_002: Missing required field
REQ_003: Invalid field value

MATCH_001: Match not found
MATCH_002: Invalid match status transition
MATCH_003: Score update not allowed

TOURNAMENT_001: Tournament not found
TOURNAMENT_002: Tournament already completed

RATE_001: Rate limit exceeded
```

## Authorization Roles

```
ADMIN: Full access to all endpoints
OFFICIAL: Can update scores and match status
TEAM_MANAGER: Can manage team and athlete information
PUBLIC: Read-only access to public endpoints
```

## Pagination

All list endpoints support pagination with these query parameters:

```
page: Page number (default: 1)
limit: Items per page (default: 20, max: 100)
```

## Filtering

Common filter parameters:

```
sport_id: Filter by sport
tournament_id: Filter by tournament
team_id: Filter by team
status: Filter by status
date: Filter by date (YYYY-MM-DD)
search: Search in names and descriptions
```

## Caching

The API implements caching using Redis:

- GET requests are cached for 5 minutes
- Medal standings are cached for 1 minute
- Real-time data is not cached
