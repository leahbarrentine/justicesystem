import { query } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  organizationId: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'investigator' | 'viewer';
  active: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithOrganization extends Omit<User, 'passwordHash'> {
  organizationName: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<UserWithOrganization | null> {
    const result = await query(
      `SELECT u.id, u.organization_id, u.email, u.first_name, u.last_name, 
              u.role, u.active, u.last_login, u.created_at, u.updated_at,
              o.name as organization_name
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(userData: {
    organizationId: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const result = await query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userData.organizationId,
        userData.email,
        passwordHash,
        userData.firstName,
        userData.lastName,
        userData.role,
      ]
    );
    return result.rows[0];
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  static async updateLastLogin(id: number): Promise<void> {
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  }

  static async findByOrganization(organizationId: number): Promise<UserWithOrganization[]> {
    const result = await query(
      `SELECT u.id, u.organization_id, u.email, u.first_name, u.last_name, 
              u.role, u.active, u.last_login, u.created_at, u.updated_at,
              o.name as organization_name
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.organization_id = $1 AND u.active = true
       ORDER BY u.last_name, u.first_name`,
      [organizationId]
    );
    return result.rows;
  }
}