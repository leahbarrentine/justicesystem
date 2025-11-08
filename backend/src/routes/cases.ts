import express from 'express';
import { CaseModel } from '../models/Case';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get all cases with filters
router.get('/', async (req, res, next) => {
  try {
    const { status, county, minPriority, limit = 50, offset = 0 } = req.query;

    const cases = await CaseModel.findAll({
      status: status as string,
      county: county as string,
      minPriority: minPriority ? Number(minPriority) : undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      cases,
      count: cases.length,
      offset: Number(offset),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
});

// Get case by ID with full details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseData = await CaseModel.findById(Number(id));

    if (!caseData) {
      throw new AppError('Case not found', 404);
    }

    // Get citations for each indicator
    const indicatorsWithCitations = await Promise.all(
      caseData.indicators.map(async (indicator: any) => {
        const citations = await CaseModel.getCitationsByIndicatorId(indicator.id);
        return {
          ...indicator,
          citations,
        };
      })
    );

    res.json({
      ...caseData,
      indicators: indicatorsWithCitations,
    });
  } catch (error) {
    next(error);
  }
});

// Claim a case (requires authentication in production)
router.post('/:id/claim', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { organizationId, userId } = req.body;

    if (!organizationId || !userId) {
      throw new AppError('Organization ID and User ID required', 400);
    }

    const updatedCase = await CaseModel.updateStatus(
      Number(id),
      'claimed',
      organizationId,
      userId
    );

    res.json({
      message: 'Case claimed successfully',
      case: updatedCase,
    });
  } catch (error) {
    next(error);
  }
});

// Update case status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('Status required', 400);
    }

    const validStatuses = ['flagged', 'claimed', 'under_investigation', 'closed', 'exonerated'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const updatedCase = await CaseModel.updateStatus(Number(id), status);

    res.json({
      message: 'Case status updated',
      case: updatedCase,
    });
  } catch (error) {
    next(error);
  }
});

// Get indicators for a case
router.get('/:id/indicators', async (req, res, next) => {
  try {
    const { id } = req.params;
    const indicators = await CaseModel.getIndicatorsByCaseId(Number(id));

    res.json({ indicators });
  } catch (error) {
    next(error);
  }
});

export default router;