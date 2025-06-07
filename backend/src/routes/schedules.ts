import express, { Request, Response, Router } from 'express';
import { ExcelService } from '../services/excel.service';
import { Event } from '../types';

const router: Router = express.Router();

// Get all schedules
router.get('/', async (_req: Request, res: Response) => {
  try {
    const events = await ExcelService.readSheet<Event>('Events');
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch schedules' 
    });
  }
});

// Get schedules by sport ID
router.get('/sport/:sportId', async (req: Request, res: Response) => {
  try {
    const sportId = Number(req.params.sportId);
    const events = await ExcelService.readSheet<Event>('Events');
    const sportEvents = events.filter(event => event.SportID === sportId);
    
    res.json({ success: true, data: sportEvents });
  } catch (error) {
    console.error('Error fetching sport schedules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sport schedules' 
    });
  }
});

export default router;