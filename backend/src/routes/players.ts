import { Router } from 'express';
import { JsonService } from '../services/json.service';
import { Player } from '../types';

const router = Router();

// GET /api/v1/players
router.get('/', async (_req, res) => {
  try {
    const players = await JsonService.readSheet<Player>('Players');
    return res.json({ success: true, data: players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch players'
    });
  }
});

// GET /api/v1/players/search
router.get('/search', async (req, res) => {
  try {
    const { q, team, sport, limit = 50 } = req.query;
    const players = await JsonService.readSheet<Player>('Players');
    
    let filtered = players;
    
    // Search by name
    if (q && typeof q === 'string') {
      const searchTerm = q.toLowerCase();
      filtered = filtered.filter(player =>
        `${player.FirstName} ${player.LastName}`.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by team
    if (team && typeof team === 'string') {
      const teamId = parseInt(team);
      if (!isNaN(teamId)) {
        filtered = filtered.filter(player => player.TeamID === teamId);
      }
    }
    
    // Filter by sport
    if (sport && typeof sport === 'string') {
      const sportId = parseInt(sport);
      if (!isNaN(sportId)) {
        filtered = filtered.filter(player => player.SportID === sportId);
      }
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    if (!isNaN(limitNum) && limitNum > 0) {
      filtered = filtered.slice(0, limitNum);
    }
    
    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error searching players:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search players'
    });
  }
});

// GET /api/v1/players/:id
router.get('/:id', async (req, res) => {
  try {
    const players = await JsonService.readSheet<Player>('Players');
    const player = players.find(p => p.ID === parseInt(req.params.id));
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    return res.json({ success: true, data: player });
  } catch (error) {
    console.error('Error fetching player:', error);
    return res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// POST /api/v1/players
router.post('/', async (req, res) => {
  try {
    const { FirstName, LastName, TeamID, SportID, SecondSportID } = req.body;

    // Validate required fields
    if (!FirstName || !LastName || !TeamID || !SportID) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: FirstName, LastName, TeamID, SportID'
      });
    }

    // Validate that second sport is different from first sport
    if (SecondSportID && SecondSportID === SportID) {
      return res.status(400).json({
        success: false,
        error: 'Second sport must be different from the first sport'
      });
    }

    // Validate team exists
    const teams = await JsonService.readSheet('Teams');
    if (!teams.some(team => team.ID === TeamID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid TeamID: Team does not exist'
      });
    }

    // Validate sport exists
    const sports = await JsonService.readSheet('Sports');
    if (!sports.some(sport => sport.ID === SportID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SportID: Sport does not exist'
      });
    }

    // Validate second sport exists if provided
    if (SecondSportID && !sports.some(sport => sport.ID === SecondSportID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SecondSportID: Sport does not exist'
      });
    }

    const playerData = {
      FirstName: FirstName.trim(),
      LastName: LastName.trim(),
      TeamID,
      SportID,
      ...(SecondSportID && { SecondSportID })
    };

    const newPlayer = await JsonService.appendToSheet<Player>('Players', playerData);
    
    return res.status(201).json({
      success: true,
      data: newPlayer,
      message: 'Player added successfully'
    });
  } catch (error) {
    console.error('Error adding player:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add player'
    });
  }
});

// PUT /api/v1/players/:id
router.put('/:id', async (req, res) => {
  try {
    const { FirstName, LastName, TeamID, SportID, SecondSportID } = req.body;
    
    // Validate that second sport is different from first sport
    if (SecondSportID && SecondSportID === SportID) {
      return res.status(400).json({
        success: false,
        error: 'Second sport must be different from the first sport'
      });
    }

    const updateData = {
      FirstName,
      LastName,
      TeamID,
      SportID,
      ...(SecondSportID && { SecondSportID })
    };

    const updatedPlayer = await JsonService.updateInSheet<Player>('Players', parseInt(req.params.id), updateData);
    return res.json({
      success: true,
      data: updatedPlayer,
      message: 'Player updated successfully'
    });
  } catch (error) {
    console.error('Error updating player:', error);
    return res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /api/v1/players/:id
router.delete('/:id', async (req, res) => {
  try {
    await JsonService.deleteFromSheet('Players', parseInt(req.params.id));
    return res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    return res.status(500).json({ error: 'Failed to delete player' });
  }
});

// POST /api/v1/players/bulk
router.post('/bulk', async (req, res) => {
  try {
    const { players } = req.body;
    
    if (!Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: players must be a non-empty array'
      });
    }

    // Validate teams and sports exist
    const teams = await JsonService.readSheet('Teams');
    const sports = await JsonService.readSheet('Sports');
    const teamIds = teams.map(t => t.ID);
    const sportIds = sports.map(s => s.ID);

    const results = [];
    const errors = [];

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const { FirstName, LastName, TeamID, SportID } = player;

      // Validate required fields
      if (!FirstName || !LastName || !TeamID || !SportID) {
        errors.push({
          index: i,
          player,
          error: 'Missing required fields'
        });
        continue;
      }

      // Validate team and sport IDs
      if (!teamIds.includes(TeamID)) {
        errors.push({
          index: i,
          player,
          error: 'Invalid TeamID'
        });
        continue;
      }

      if (!sportIds.includes(SportID)) {
        errors.push({
          index: i,
          player,
          error: 'Invalid SportID'
        });
        continue;
      }

      try {
        const newPlayer = await JsonService.appendToSheet<Player>('Players', {
          FirstName: FirstName.trim(),
          LastName: LastName.trim(),
          TeamID,
          SportID
        });
        results.push(newPlayer);
      } catch (error) {
        errors.push({
          index: i,
          player,
          error: 'Failed to create player'
        });
      }
    }

    return res.json({
      success: true,
      data: {
        created: results,
        errors,
        summary: {
          total: players.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Bulk operation completed: ${results.length} players created, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error in bulk player creation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process bulk player creation'
    });
  }
});

// DELETE /api/v1/players/bulk
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: ids must be a non-empty array'
      });
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await JsonService.deleteFromSheet('Players', parseInt(id));
        results.push(id);
      } catch (error) {
        errors.push({
          id,
          error: 'Failed to delete player'
        });
      }
    }

    return res.json({
      success: true,
      data: {
        deleted: results,
        errors,
        summary: {
          total: ids.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Bulk deletion completed: ${results.length} players deleted, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error in bulk player deletion:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process bulk player deletion'
    });
  }
});

export default router;