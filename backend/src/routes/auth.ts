import express from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }

    const user = await UserModel.verifyPassword(email, password);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.active) {
      throw new AppError('Account is inactive', 403);
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT secret not configured', 500);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register new user (admin only in production)
router.post('/register', async (req, res, next) => {
  try {
    const { organizationId, email, password, firstName, lastName, role } = req.body;

    if (!organizationId || !email || !password || !firstName || !lastName || !role) {
      throw new AppError('All fields required', 400);
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const user = await UserModel.create({
      organizationId,
      email,
      password,
      firstName,
      lastName,
      role,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    // In production, this would use the authenticate middleware
    // For now, return minimal structure
    res.json({ message: 'User profile endpoint' });
  } catch (error) {
    next(error);
  }
});

export default router;