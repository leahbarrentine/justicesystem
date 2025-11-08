import { query } from '../config/database';

export interface Case {
  id: number;
  caseNumber: string;
  defendantName: string;
  convictionDate: Date | null;
  sentence: string | null;
  crimeCharged: string;
  county: string;
  courtName: string | null;
  caseStatus: 'flagged' | 'claimed' | 'under_investigation' | 'closed' | 'exonerated';
  priorityScore: number | null;
  claimedByOrgId: number | null;
  claimedByUserId: number | null;
  claimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseWithIndicators extends Case {
  indicators: Array<{
    id: number;
    name: string;
    severity: string;
    confidenceScore: number;
    category: string;
  }>;
  demographics: {
    age: number | null;
    race: string | null;
    gender: string | null;
  } | null;
}

export class CaseModel {
  static async findAll(filters: {
    status?: string;
    county?: string;
    minPriority?: number;
    limit?: number;
    offset?: number;
  }): Promise<Case[]> {
    let sql = 'SELECT * FROM cases WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND case_status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.county) {
      sql += ` AND county = $${paramCount}`;
      params.push(filters.county);
      paramCount++;
    }

    if (filters.minPriority) {
      sql += ` AND priority_score >= $${paramCount}`;
      params.push(filters.minPriority);
      paramCount++;
    }

    sql += ' ORDER BY priority_score DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id: number): Promise<CaseWithIndicators | null> {
    const caseResult = await query('SELECT * FROM cases WHERE id = $1', [id]);
    
    if (caseResult.rows.length === 0) {
      return null;
    }

    const caseData = caseResult.rows[0];

    // Get indicators
    const indicatorsResult = await query(
      `SELECT ci.id, i.name, i.severity, ci.confidence_score, ic.name as category
       FROM case_indicators ci
       JOIN indicators i ON ci.indicator_id = i.id
       JOIN indicator_categories ic ON i.category_id = ic.id
       WHERE ci.case_id = $1`,
      [id]
    );

    // Get demographics
    const demographicsResult = await query(
      'SELECT defendant_age_at_conviction as age, defendant_race as race, defendant_gender as gender FROM case_demographics WHERE case_id = $1',
      [id]
    );

    return {
      ...caseData,
      indicators: indicatorsResult.rows,
      demographics: demographicsResult.rows[0] || null,
    };
  }

  static async create(caseData: Partial<Case>): Promise<Case> {
    const result = await query(
      `INSERT INTO cases (case_number, defendant_name, conviction_date, sentence, crime_charged, county, court_name, case_status, priority_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        caseData.caseNumber,
        caseData.defendantName,
        caseData.convictionDate,
        caseData.sentence,
        caseData.crimeCharged,
        caseData.county,
        caseData.courtName,
        caseData.caseStatus || 'flagged',
        caseData.priorityScore,
      ]
    );
    return result.rows[0];
  }

  static async updateStatus(
    id: number,
    status: string,
    orgId?: number,
    userId?: number
  ): Promise<Case> {
    const result = await query(
      `UPDATE cases 
       SET case_status = $1, 
           claimed_by_org_id = $2, 
           claimed_by_user_id = $3,
           claimed_at = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, orgId || null, userId || null, new Date(), id]
    );
    return result.rows[0];
  }

  static async addIndicator(
    caseId: number,
    indicatorId: number,
    confidenceScore: number
  ): Promise<void> {
    await query(
      `INSERT INTO case_indicators (case_id, indicator_id, confidence_score)
       VALUES ($1, $2, $3)
       ON CONFLICT (case_id, indicator_id) DO UPDATE SET confidence_score = $3`,
      [caseId, indicatorId, confidenceScore]
    );
  }

  static async getIndicatorsByCaseId(caseId: number) {
    const result = await query(
      `SELECT ci.*, i.name, i.severity, i.description, ic.name as category
       FROM case_indicators ci
       JOIN indicators i ON ci.indicator_id = i.id
       JOIN indicator_categories ic ON i.category_id = ic.id
       WHERE ci.case_id = $1
       ORDER BY i.severity DESC, ci.confidence_score DESC`,
      [caseId]
    );
    return result.rows;
  }

  static async getCitationsByIndicatorId(caseIndicatorId: number) {
    const result = await query(
      `SELECT * FROM evidence_citations 
       WHERE case_indicator_id = $1
       ORDER BY page_number, line_number`,
      [caseIndicatorId]
    );
    return result.rows;
  }
}