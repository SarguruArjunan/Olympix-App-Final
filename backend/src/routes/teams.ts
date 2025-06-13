import { Request, Response, Router } from 'express';
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

// POST /api/v1/teams
router.post('/', async (req: Request, res: Response) => {
  try {
    const { Name, Country, Logo_URL, Organization, TagLine, Color } = req.body;
    
    // Validate required fields
    if (!Name || !Organization || !TagLine) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Name, Organization, TagLine'
      });
    }

    const teamData: Omit<Team, 'ID'> = {
      Name,
      Country: Country || '',
      Logo_URL: Logo_URL || '',
      Organization,
      TagLine,
      Color: Color || '#000000'
    };

    await ExcelService.appendToSheet<Team>('Teams', teamData);
    
    return res.status(201).json({
      success: true,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create team'
    });
  }
});

// PUT /api/v1/teams/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { Name, Country, Logo_URL, Organization, TagLine, Color } = req.body;
    
    const updateData: Partial<Omit<Team, 'ID'>> = {};
    if (Name !== undefined) updateData.Name = Name;
    if (Country !== undefined) updateData.Country = Country;
    if (Logo_URL !== undefined) updateData.Logo_URL = Logo_URL;
    if (Organization !== undefined) updateData.Organization = Organization;
    if (TagLine !== undefined) updateData.TagLine = TagLine;
    if (Color !== undefined) updateData.Color = Color;

    await ExcelService.updateInSheet<Team>('Teams', id, updateData);
    
    return res.json({
      success: true,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    if (error instanceof Error && error.message === 'Record not found') {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update team'
      });
    }
  }
});

// DELETE /api/v1/teams/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    await ExcelService.deleteFromSheet<Team>('Teams', id);
    
    return res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete team'
    });
  }
});

export default router;