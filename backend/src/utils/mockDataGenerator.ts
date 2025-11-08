import { query } from '../config/database';

/**
 * Generates realistic mock case data for testing
 */

const COUNTIES = [
  'Los Angeles', 'San Francisco', 'San Diego', 'Orange', 'Riverside',
  'Sacramento', 'Alameda', 'Contra Costa', 'Fresno', 'Kern'
];

const CRIMES = [
  'First-degree murder', 'Armed robbery', 'Sexual assault', 
  'Aggravated assault', 'Drug trafficking', 'Burglary',
  'Kidnapping', 'Manslaughter', 'Arson', 'Grand theft auto'
];

const FIRST_NAMES = [
  'Marcus', 'DeShawn', 'Jamal', 'Michael', 'James', 'Robert',
  'Carlos', 'Jose', 'Luis', 'David', 'Anthony', 'Kevin'
];

const LAST_NAMES = [
  'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez',
  'Rodriguez', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'
];

const RACES = ['Black', 'Hispanic', 'White', 'Asian', 'Other'];
const GENDERS = ['Male', 'Female'];

interface MockCase {
  caseNumber: string;
  defendantName: string;
  convictionDate: Date;
  sentence: string;
  crimeCharged: string;
  county: string;
  courtName: string;
  indicators: number[];
  demographics: {
    age: number;
    race: string;
    gender: string;
  };
  transcript: string;
}

export class MockDataGenerator {
  private random(max: number): number {
    return Math.floor(Math.random() * max);
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  private generateCaseNumber(year: number): string {
    return `CR${year}-${String(this.random(99999)).padStart(5, '0')}`;
  }

  private generateTranscript(indicators: number[]): string {
    // Generate realistic transcript snippets based on indicators
    const snippets: string[] = [
      'The court is now in session. Case number ' + this.generateCaseNumber(2020),
    ];

    // Add indicator-specific content
    if (indicators.includes(1)) {
      snippets.push(
        'Defense counsel raised concerns about the interrogation lasting over 12 hours without breaks.'
      );
    }

    if (indicators.includes(5)) {
      snippets.push(
        'The identification was made from a single photograph, and the witness expressed uncertainty.'
      );
    }

    if (indicators.includes(17)) {
      snippets.push(
        'The court notes a Brady violation as exculpatory evidence was withheld from the defense.'
      );
    }

    return snippets.join('\n\n');
  }

  async generateMockCase(): Promise<number> {
    // Generate random case data
    const firstName = FIRST_NAMES[this.random(FIRST_NAMES.length)];
    const lastName = LAST_NAMES[this.random(LAST_NAMES.length)];
    const defendantName = `${firstName} ${lastName}`;
    
    const convictionYear = 2015 + this.random(8);
    const convictionDate = this.randomDate(
      new Date(convictionYear, 0, 1),
      new Date(convictionYear, 11, 31)
    );

    const county = COUNTIES[this.random(COUNTIES.length)];
    const crime = CRIMES[this.random(CRIMES.length)];
    
    // Randomly select 2-6 indicators for this case
    const indicatorCount = 2 + this.random(5);
    const allIndicatorIds = Array.from({ length: 36 }, (_, i) => i + 1);
    const selectedIndicators: number[] = [];
    
    for (let i = 0; i < indicatorCount; i++) {
      const idx = this.random(allIndicatorIds.length);
      selectedIndicators.push(allIndicatorIds[idx]);
      allIndicatorIds.splice(idx, 1);
    }

    // Create case
    const caseResult = await query(
      `INSERT INTO cases (
        case_number, defendant_name, conviction_date, sentence, 
        crime_charged, county, court_name, case_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        this.generateCaseNumber(convictionYear),
        defendantName,
        convictionDate,
        `${10 + this.random(40)} years to life`,
        crime,
        county,
        `${county} County Superior Court`,
        'flagged'
      ]
    );

    const caseId = caseResult.rows[0].id;

    // Add demographics
    await query(
      `INSERT INTO case_demographics (
        case_id, defendant_age_at_conviction, defendant_race, defendant_gender
      )
      VALUES ($1, $2, $3, $4)`,
      [
        caseId,
        18 + this.random(40),
        RACES[this.random(RACES.length)],
        GENDERS[this.random(GENDERS.length)]
      ]
    );

    // Add indicators with confidence scores
    for (const indicatorId of selectedIndicators) {
      const confidence = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
      
      await query(
        `INSERT INTO case_indicators (case_id, indicator_id, confidence_score)
        VALUES ($1, $2, $3)`,
        [caseId, indicatorId, confidence]
      );

      // Add evidence citations
      const citationCount = 1 + this.random(3);
      for (let i = 0; i < citationCount; i++) {
        await query(
          `INSERT INTO evidence_citations (
            case_id, case_indicator_id, document_type, page_number,
            line_number, quoted_text, context_before, context_after
          )
          SELECT $1, ci.id, $3, $4, $5, $6, $7, $8
          FROM case_indicators ci
          WHERE ci.case_id = $1 AND ci.indicator_id = $2
          LIMIT 1`,
          [
            caseId,
            indicatorId,
            'transcript',
            this.random(200) + 1,
            this.random(50) + 1,
            'Relevant quoted text from document',
            'Context before the quoted text',
            'Context after the quoted text'
          ]
        );
      }
    }

    // Calculate and update priority score
    const rankingService = require('../services/rankingService');
    const indicators = await query(
      `SELECT ci.*, i.severity, i.weight, ic.weight as category_weight
       FROM case_indicators ci
       JOIN indicators i ON ci.indicator_id = i.id
       JOIN indicator_categories ic ON i.category_id = ic.id
       WHERE ci.case_id = $1`,
      [caseId]
    );

    const score = rankingService.RankingService.calculatePriorityScore(
      indicators.rows.map((i: any) => ({
        indicatorId: i.indicator_id,
        severity: i.severity,
        weight: i.weight,
        categoryWeight: i.category_weight,
        confidenceScore: i.confidence_score,
      }))
    );

    await query(
      'UPDATE cases SET priority_score = $1 WHERE id = $2',
      [score, caseId]
    );

    return caseId;
  }

  async generateMultipleCases(count: number): Promise<number[]> {
    const caseIds: number[] = [];
    
    console.log(`Generating ${count} mock cases...`);
    
    for (let i = 0; i < count; i++) {
      const caseId = await this.generateMockCase();
      caseIds.push(caseId);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1}/${count} cases`);
      }
    }
    
    console.log(`Successfully generated ${count} mock cases`);
    return caseIds;
  }
}