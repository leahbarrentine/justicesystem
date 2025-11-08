import { query } from '../config/database';

export interface Organization {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationModel {
  static async findAll(): Promise<Organization[]> {
    const result = await query('SELECT * FROM organizations WHERE active = true ORDER BY name');
    return result.rows;
  }

  static async findById(id: number): Promise<Organization | null> {
    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(orgData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
  }): Promise<Organization> {
    const result = await query(
      `INSERT INTO organizations (name, email, phone, address, website)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orgData.name, orgData.email, orgData.phone, orgData.address, orgData.website]
    );
    return result.rows[0];
  }

  static async getClaimedCases(organizationId: number) {
    const result = await query(
      `SELECT c.*, COUNT(ci.id) as indicator_count
       FROM cases c
       LEFT JOIN case_indicators ci ON c.id = ci.case_id
       WHERE c.claimed_by_org_id = $1
       GROUP BY c.id
       ORDER BY c.priority_score DESC`,
      [organizationId]
    );
    return result.rows;
  }
}