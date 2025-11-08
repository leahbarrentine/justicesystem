import express from 'express';
import { OrganizationModel } from '../models/Organization';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get all organizations
router.get('/', async (req, res, next) => {
  try {
    const organizations = await OrganizationModel.findAll();
    res.json({ organizations });
  } catch (error) {
    next(error);
  }
});

// Get organization by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await OrganizationModel.findById(Number(id));

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    res.json({ organization });
  } catch (error) {
    next(error);
  }
});

// Get cases claimed by organization
router.get('/:id/cases', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cases = await OrganizationModel.getClaimedCases(Number(id));

    res.json({ cases });
  } catch (error) {
    next(error);
  }
});

// Get users in organization
router.get('/:id/users', async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await UserModel.findByOrganization(Number(id));

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Create organization
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, address, website } = req.body;

    if (!name || !email) {
      throw new AppError('Name and email required', 400);
    }

    const organization = await OrganizationModel.create({
      name,
      email,
      phone,
      address,
      website,
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization,
    });
  } catch (error) {
    next(error);
  }
});

export default router;