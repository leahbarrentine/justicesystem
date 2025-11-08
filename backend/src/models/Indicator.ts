import { query } from '../config/database';

export interface Indicator {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  detectionPattern: string | null;
  createdAt: Date;
}

export interface IndicatorCategory {
  id: number;
  name: string;
  description: string;
  weight: number;
  createdAt: Date;
}

export interface IndicatorWithCategory extends Indicator {
  categoryName: string;
  categoryWeight: number;
}

export class IndicatorModel {
  static async findAll(): Promise<IndicatorWithCategory[]> {
    const result = await query(
      `SELECT i.*, ic.name as category_name, ic.weight as category_weight
       FROM indicators i
       JOIN indicator_categories ic ON i.category_id = ic.id
       ORDER BY ic.name, i.severity DESC, i.name`
    );
    return result.rows;
  }

  static async findById(id: number): Promise<IndicatorWithCategory | null> {
    const result = await query(
      `SELECT i.*, ic.name as category_name, ic.weight as category_weight
       FROM indicators i
       JOIN indicator_categories ic ON i.category_id = ic.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCategory(categoryId: number): Promise<Indicator[]> {
    const result = await query(
      'SELECT * FROM indicators WHERE category_id = $1 ORDER BY severity DESC, name',
      [categoryId]
    );
    return result.rows;
  }

  static async getAllCategories(): Promise<IndicatorCategory[]> {
    const result = await query('SELECT * FROM indicator_categories ORDER BY name');
    return result.rows;
  }

  static async findBySeverity(severity: string): Promise<IndicatorWithCategory[]> {
    const result = await query(
      `SELECT i.*, ic.name as category_name, ic.weight as category_weight
       FROM indicators i
       JOIN indicator_categories ic ON i.category_id = ic.id
       WHERE i.severity = $1
       ORDER BY ic.name, i.name`,
      [severity]
    );
    return result.rows;
  }
}