import { Router } from 'express';
import { ExcelService } from '../services/excel.service';
import { Team } from '../types';

const router = Router();

// GET /api/v1/teams
router.get('/', async (_req, res) => {
  try {
    const teams = await ExcelService.readSheet<Team>('Teams');
    return res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch teams'
    });
  }
});

// GET /api/v1/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const teams = await ExcelService.readSheet<Team>('Teams');
    const team = teams.find(t => t.ID === parseInt(req.params.id));
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    return res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch team'
    });
  }
});

export default router;