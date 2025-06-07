import express, { Request, Response, Router } from 'express';
import { ExcelService } from '../services/excel.service';
import { Sport } from '../types';

const router: Router = express.Router();

// Get all sports
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sports = await ExcelService.readSheet<Sport>('Sports');
    res.json({ success: true, data: sports });
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sports' 
    });
  }
});

interface SportParams {
  id: string;
}

// Get sport by ID
router.get('/:id', async (req: Request<SportParams>, res: Response) => {
  try {
    const sports = await ExcelService.readSheet<Sport>('Sports');
    const sport = sports.find(s => s.ID === Number(req.params.id));
    
    if (!sport) {
      res.status(404).json({ 
        success: false, 
        error: 'Sport not found' 
      });
      return;
    }

    res.json({ success: true, data: sport });
  } catch (error) {
    console.error('Error fetching sport:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sport' 
    });
  }
});

interface CreateSportBody {
  Name: string;
  Icon_URL?: string;
  Description: string;
}

// Create new sport
router.post('/', async (req: Request<{}, {}, CreateSportBody>, res: Response) => {
  try {
    const { Name, Icon_URL, Description } = req.body;

    // Validate required fields
    if (!Name || !Description) {
      res.status(400).json({
        success: false,
        error: 'Name and Description are required'
      });
      return;
    }

    // Validate sport name
    const allowedSports = [
      'Foosball', 'Carrom', 'Chess', 'Table Tennis',
      'Badminton', 'Cricket', 'Football', 'Basketball',
      'Lemon Spoon Race'
    ];

    if (!allowedSports.includes(Name)) {
      res.status(400).json({
        success: false,
        error: 'Invalid sport name. Must be one of the allowed sports.'
      });
      return;
    }

    // Check if sport already exists
    const sports = await ExcelService.readSheet<Sport>('Sports');
    if (sports.some(s => s.Name === Name)) {
      res.status(400).json({
        success: false,
        error: 'Sport already exists'
      });
      return;
    }

    await ExcelService.appendToSheet<Sport>('Sports', {
      Name,
      Icon_URL: Icon_URL || '',
      Description
    });

    res.status(201).json({ 
      success: true, 
      message: 'Sport created successfully' 
    });
  } catch (error) {
    console.error('Error creating sport:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create sport' 
    });
  }
});

interface UpdateSportBody {
  Icon_URL?: string;
  Description?: string;
  Name?: never; // Ensure Name can't be included
}

// Update sport
router.put('/:id', async (req: Request<SportParams, {}, UpdateSportBody>, res: Response) => {
  try {
    const sportId = Number(req.params.id);
    const { Icon_URL, Description } = req.body;

    const sports = await ExcelService.readSheet<Sport>('Sports');
    const sport = sports.find(s => s.ID === sportId);

    if (!sport) {
      res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
      return;
    }

    await ExcelService.updateInSheet<Sport>('Sports', sportId, {
      Icon_URL,
      Description
    });

    res.json({ 
      success: true, 
      message: 'Sport updated successfully' 
    });
  } catch (error) {
    console.error('Error updating sport:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update sport' 
    });
  }
});

// Delete sport
router.delete('/:id', async (req: Request<SportParams>, res: Response) => {
  try {
    const sportId = Number(req.params.id);
    
    const sports = await ExcelService.readSheet<Sport>('Sports');
    const sport = sports.find(s => s.ID === sportId);

    if (!sport) {
      res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
      return;
    }

    await ExcelService.deleteFromSheet('Sports', sportId);

    res.json({ 
      success: true, 
      message: 'Sport deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting sport:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete sport' 
    });
  }
});

export default router;