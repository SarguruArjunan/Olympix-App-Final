import { Router } from 'express';
import { ExcelService } from '../services/excel.service';
import { Medal, Team, Sport } from '../types';

const router = Router();

// GET /api/v1/medals
router.get('/', async (_req, res) => {
  try {
    const medals = await ExcelService.readSheet<Medal>('Medals');
    return res.json({ success: true, data: medals });
  } catch (error) {
    console.error('Error fetching medals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch medals'
    });
  }
});

// GET /api/v1/medals/:id
router.get('/:id', async (req, res) => {
  try {
    const medals = await ExcelService.readSheet<Medal>('Medals');
    const medal = medals.find(m => m.ID === parseInt(req.params.id));
    
    if (!medal) {
      return res.status(404).json({ error: 'Medal not found' });
    }
    
    return res.json({ success: true, data: medal });
  } catch (error) {
    console.error('Error fetching medal:', error);
    return res.status(500).json({ error: 'Failed to fetch medal' });
  }
});

// POST /api/v1/medals
router.post('/', async (req, res) => {
  try {
    const { TeamID, SportID, Gold, Silver, Bronze, Total } = req.body;

    // Validate required fields
    if (!TeamID || !SportID || Gold === undefined || Silver === undefined || Bronze === undefined || Total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: TeamID, SportID, Gold, Silver, Bronze, Total'
      });
    }

    // Validate numeric values
    if (!Number.isInteger(TeamID) || !Number.isInteger(SportID) || 
        !Number.isInteger(Gold) || !Number.isInteger(Silver) || 
        !Number.isInteger(Bronze) || !Number.isInteger(Total)) {
      return res.status(400).json({
        success: false,
        error: 'All fields must be valid integers'
      });
    }

    // Validate non-negative values
    if (Gold < 0 || Silver < 0 || Bronze < 0 || Total < 0) {
      return res.status(400).json({
        success: false,
        error: 'Medal counts cannot be negative'
      });
    }

    // Validate total matches sum of medals
    const calculatedTotal = Gold + Silver + Bronze;
    if (calculatedTotal !== Total) {
      return res.status(400).json({
        success: false,
        error: 'Total must equal the sum of Gold, Silver, and Bronze medals'
      });
    }

    // Validate team exists
    const teams = await ExcelService.readSheet<Team>('Teams');
    if (!teams.some(team => team.ID === TeamID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid TeamID: Team does not exist'
      });
    }

    // Validate sport exists
    const sports = await ExcelService.readSheet<Sport>('Sports');
    if (!sports.some(sport => sport.ID === SportID)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SportID: Sport does not exist'
      });
    }

    // Check if medal entry already exists for this team and sport
    const medals = await ExcelService.readSheet<Medal>('Medals');
    if (medals.some(medal => medal.TeamID === TeamID && medal.SportID === SportID)) {
      return res.status(400).json({
        success: false,
        error: 'Medal entry already exists for this team and sport'
      });
    }

    await ExcelService.appendToSheet<Medal>('Medals', {
      TeamID,
      SportID,
      Gold,
      Silver,
      Bronze,
      Total
    });
    return res.status(201).json({ 
      success: true,
      message: 'Medal added successfully' 
    });
  } catch (error) {
    console.error('Error adding medal:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to add medal' 
    });
  }
});

// PUT /api/v1/medals/:id
router.put('/:id', async (req, res) => {
  try {
    const { TeamID, SportID, Gold, Silver, Bronze, Total } = req.body;

    // Validate required fields
    if (!TeamID || !SportID || Gold === undefined || Silver === undefined || Bronze === undefined || Total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: TeamID, SportID, Gold, Silver, Bronze, Total'
      });
    }

    // Convert values to integers to ensure proper validation
    const goldInt = parseInt(Gold, 10);
    const silverInt = parseInt(Silver, 10);
    const bronzeInt = parseInt(Bronze, 10);
    const totalInt = parseInt(Total, 10);
    const teamIDInt = parseInt(TeamID, 10);
    const sportIDInt = parseInt(SportID, 10);

    // Validate numeric values
    if (!Number.isInteger(teamIDInt) || !Number.isInteger(sportIDInt) || 
        !Number.isInteger(goldInt) || !Number.isInteger(silverInt) || 
        !Number.isInteger(bronzeInt) || !Number.isInteger(totalInt)) {
      return res.status(400).json({
        success: false,
        error: 'All fields must be valid integers'
      });
    }

    // Validate non-negative values
    if (goldInt < 0 || silverInt < 0 || bronzeInt < 0 || totalInt < 0) {
      return res.status(400).json({
        success: false,
        error: 'Medal counts cannot be negative'
      });
    }

    // Validate total matches sum of medals
    const calculatedTotal = goldInt + silverInt + bronzeInt;
    if (calculatedTotal !== totalInt) {
      return res.status(400).json({
        success: false,
        error: 'Total must equal the sum of Gold, Silver, and Bronze medals'
      });
    }

    // Validate team exists
    const teams = await ExcelService.readSheet<Team>('Teams');
    if (!teams.some(team => team.ID === teamIDInt)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid TeamID: Team does not exist'
      });
    }

    // Validate sport exists
    const sports = await ExcelService.readSheet<Sport>('Sports');
    if (!sports.some(sport => sport.ID === sportIDInt)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SportID: Sport does not exist'
      });
    }

    await ExcelService.updateInSheet<Medal>('Medals', parseInt(req.params.id), {
      TeamID: teamIDInt,
      SportID: sportIDInt,
      Gold: goldInt,
      Silver: silverInt,
      Bronze: bronzeInt,
      Total: totalInt
    });
    return res.json({ 
      success: true,
      message: 'Medal updated successfully' 
    });
  } catch (error) {
    console.error('Error updating medal:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update medal' 
    });
  }
});

// DELETE /api/v1/medals/:id
router.delete('/:id', async (req, res) => {
  try {
    await ExcelService.deleteFromSheet<Medal>('Medals', parseInt(req.params.id));
    return res.json({ message: 'Medal deleted successfully' });
  } catch (error) {
    console.error('Error deleting medal:', error);
    return res.status(500).json({ error: 'Failed to delete medal' });
  }
});

export default router;