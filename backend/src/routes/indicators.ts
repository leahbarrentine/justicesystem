import express from 'express';
import { IndicatorModel } from '../models/Indicator';

const router = express.Router();

// Get all indicators
router.get('/', async (req, res, next) => {
  try {
    const { severity, categoryId } = req.query;

    let indicators;
    if (severity) {
      indicators = await IndicatorModel.findBySeverity(severity as string);
    } else if (categoryId) {
      indicators = await IndicatorModel.findByCategory(Number(categoryId));
    } else {
      indicators = await IndicatorModel.findAll();
    }

    res.json({ indicators });
  } catch (error) {
    next(error);
  }
});

// Get all indicator categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await IndicatorModel.getAllCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// Get indicator by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const indicator = await IndicatorModel.findById(Number(id));

    if (!indicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }

    res.json({ indicator });
  } catch (error) {
    next(error);
  }
});

export default router;