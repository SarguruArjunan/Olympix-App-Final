import { Router } from 'express';
import { ExcelService } from '../services/excel.service';

const router = Router();

// GET /api/v1/medals
router.get('/', async (_req, res) => {
  try {
    const medals = await ExcelService.readSheet('Medals');
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
    const medals = await ExcelService.readSheet('Medals');
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
    await ExcelService.appendToSheet('Medals', {
      TeamID,
      SportID,
      Gold,
      Silver,
      Bronze,
      Total
    });
    return res.status(201).json({ message: 'Medal added successfully' });
  } catch (error) {
    console.error('Error adding medal:', error);
    return res.status(500).json({ error: 'Failed to add medal' });
  }
});

// PUT /api/v1/medals/:id
router.put('/:id', async (req, res) => {
  try {
    const { TeamID, SportID, Gold, Silver, Bronze, Total } = req.body;
    await ExcelService.updateInSheet('Medals', parseInt(req.params.id), {
      TeamID,
      SportID,
      Gold,
      Silver,
      Bronze,
      Total
    });
    return res.json({ message: 'Medal updated successfully' });
  } catch (error) {
    console.error('Error updating medal:', error);
    return res.status(500).json({ error: 'Failed to update medal' });
  }
});

// DELETE /api/v1/medals/:id
router.delete('/:id', async (req, res) => {
  try {
    await ExcelService.deleteFromSheet('Medals', parseInt(req.params.id));
    return res.json({ message: 'Medal deleted successfully' });
  } catch (error) {
    console.error('Error deleting medal:', error);
    return res.status(500).json({ error: 'Failed to delete medal' });
  }
});

export default router;