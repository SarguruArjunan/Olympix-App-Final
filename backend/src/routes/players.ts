import { Router } from 'express';
import { ExcelService } from '../services/excel.service';
import { Player } from '../types';

const router = Router();

// GET /api/v1/players
router.get('/', async (_req, res) => {
  try {
    const players = await ExcelService.readSheet<Player>('Players');
    return res.json({ success: true, data: players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch players'
    });
  }
});

// GET /api/v1/players/:id
router.get('/:id', async (req, res) => {
  try {
    const players = await ExcelService.readSheet<Player>('Players');
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
    const { FirstName, LastName, TeamID, SportID } = req.body;

    // Validate required fields
    if (!FirstName || !LastName || !TeamID || !SportID) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: FirstName, LastName, TeamID, SportID'
      });
    }

    // Validate team exists
    const teams = await ExcelService.readSheet('Teams');
    if (!teams.some(team => team.ID === TeamID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid TeamID: Team does not exist'
      });
    }

    // Validate sport exists
    const sports = await ExcelService.readSheet('Sports');
    if (!sports.some(sport => sport.ID === SportID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SportID: Sport does not exist'
      });
    }

    await ExcelService.appendToSheet<Player>('Players', {
      FirstName,
      LastName,
      TeamID,
      SportID
    });
    
    return res.status(201).json({ 
      success: true,
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
    const { FirstName, LastName, TeamID, SportID } = req.body;
    await ExcelService.updateInSheet<Player>('Players', parseInt(req.params.id), {
      FirstName,
      LastName,
      TeamID,
      SportID
    });
    return res.json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error('Error updating player:', error);
    return res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /api/v1/players/:id
router.delete('/:id', async (req, res) => {
  try {
    await ExcelService.deleteFromSheet<Player>('Players', parseInt(req.params.id));
    return res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router; 