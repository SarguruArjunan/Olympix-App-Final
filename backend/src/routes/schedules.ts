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

// Get schedules by team ID
router.get('/team/:teamId', async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    const events = await ExcelService.readSheet<Event>('Events');
    const teamEvents = events.filter(event => 
      event.TeamA_ID === teamId || event.TeamB_ID === teamId
    );
    
    res.json({ success: true, data: teamEvents });
  } catch (error) {
    console.error('Error fetching team schedules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch team schedules' 
    });
  }
});

// Get single event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const events = await ExcelService.readSheet<Event>('Events');
    const event = events.find(e => e.ID === id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }
    
    return res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch event' 
    });
  }
});

// Create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Creating event with data:', req.body);
    const { SportID, Name, Date, Time, Location, TeamA_ID, TeamB_ID, Status } = req.body;
    
    // Validate required fields
    if (!SportID || !Name || !Date || !Time || !Location) {
      console.error('Missing required fields in event creation');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: SportID, Name, Date, Time, Location'
      });
    }

    // Validate data length to prevent Excel errors
    if (Name.length > 32000) {
      return res.status(400).json({
        success: false,
        error: 'Event name is too long (max 32000 characters)'
      });
    }

    if (Location.length > 32000) {
      return res.status(400).json({
        success: false,
        error: 'Location is too long (max 32000 characters)'
      });
    }

    const eventData: Omit<Event, 'ID'> = {
      SportID: Number(SportID),
      Name: String(Name).trim(),
      Date: String(Date).trim(),
      Time: String(Time).trim(),
      Location: String(Location).trim(),
      TeamA_ID: TeamA_ID ? Number(TeamA_ID) : undefined,
      TeamB_ID: TeamB_ID ? Number(TeamB_ID) : undefined,
      Status: Status || 'Scheduled'
    };

    console.log('Attempting to save event:', eventData);
    await ExcelService.appendToSheet<Event>('Events', eventData);
    console.log('Event created successfully');
    
    return res.status(201).json({
      success: true,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    let errorMessage = 'Failed to create event';
    if (error instanceof Error) {
      if (error.message.includes('32767')) {
        errorMessage = 'Event data is too long - please reduce the length of text fields';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Excel file not found - database may need to be reset';
      } else {
        errorMessage = `Failed to create event: ${error.message}`;
      }
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { SportID, Name, Date, Time, Location, TeamA_ID, TeamB_ID, Status, WinnerTeamID, TeamA_Score, TeamB_Score, ResultNotes } = req.body;
    
    const updateData: Partial<Omit<Event, 'ID'>> = {};
    if (SportID !== undefined) updateData.SportID = Number(SportID);
    if (Name !== undefined) updateData.Name = Name;
    if (Date !== undefined) updateData.Date = Date;
    if (Time !== undefined) updateData.Time = Time;
    if (Location !== undefined) updateData.Location = Location;
    if (TeamA_ID !== undefined) updateData.TeamA_ID = TeamA_ID ? Number(TeamA_ID) : undefined;
    if (TeamB_ID !== undefined) updateData.TeamB_ID = TeamB_ID ? Number(TeamB_ID) : undefined;
    if (Status !== undefined) updateData.Status = Status;
    if (WinnerTeamID !== undefined) updateData.WinnerTeamID = WinnerTeamID ? Number(WinnerTeamID) : undefined;
    if (TeamA_Score !== undefined) updateData.TeamA_Score = TeamA_Score;
    if (TeamB_Score !== undefined) updateData.TeamB_Score = TeamB_Score;
    if (ResultNotes !== undefined) updateData.ResultNotes = ResultNotes;

    await ExcelService.updateInSheet<Event>('Events', id, updateData);
    
    return res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error && error.message === 'Record not found') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update event'
      });
    }
  }
});

// Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    await ExcelService.deleteFromSheet<Event>('Events', id);
    
    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
});

export default router;