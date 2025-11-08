/**
 * Priority Ranking Algorithm for Wrongful Conviction Cases
 * 
 * Calculates a priority score based on:
 * - Number of indicators present
 * - Severity/reliability of each indicator type
 * - Quality and specificity of evidence pointing toward innocence
 * - Presence of exculpatory evidence
 */

interface IndicatorScore {
  indicatorId: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  categoryWeight: number;
  confidenceScore: number;
}

// Severity multipliers
const SEVERITY_MULTIPLIERS = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
  critical: 3.0,
};

// Bonus for specific high-value indicator combinations
const INDICATOR_COMBINATIONS = {
  'DNA + Misconduct': 1.5,
  'Recantation + Weak Evidence': 1.3,
  'Multiple Appeals + New Evidence': 1.4,
};

export class RankingService {
  /**
   * Calculate priority score for a case
   */
  static calculatePriorityScore(indicators: IndicatorScore[]): number {
    if (indicators.length === 0) {
      return 0;
    }

    // Base score from individual indicators
    let baseScore = 0;
    for (const indicator of indicators) {
      const severityMultiplier = SEVERITY_MULTIPLIERS[indicator.severity];
      const indicatorScore =
        indicator.weight *
        indicator.categoryWeight *
        severityMultiplier *
        indicator.confidenceScore;
      
      baseScore += indicatorScore;
    }

    // Count multiplier (more indicators = higher confidence)
    const countMultiplier = 1 + Math.min(indicators.length * 0.1, 1.0);

    // Check for high-value combinations
    let combinationBonus = 1.0;
    const indicatorNames = new Set(indicators.map(i => i.indicatorId));

    // Apply combination bonuses based on indicator patterns
    if (this.hasCombination(indicators, ['DNA Not Tested', 'Brady Violations'])) {
      combinationBonus = Math.max(combinationBonus, 1.5);
    }
    if (this.hasCombination(indicators, ['Witness Recantation', 'Weak Prosecution Evidence'])) {
      combinationBonus = Math.max(combinationBonus, 1.3);
    }
    if (this.hasCombination(indicators, ['Multiple Appeals', 'New Exculpatory Evidence'])) {
      combinationBonus = Math.max(combinationBonus, 1.4);
    }

    // Critical indicator boost
    const hasCritical = indicators.some(i => i.severity === 'critical');
    const criticalBonus = hasCritical ? 1.2 : 1.0;

    // Final score (normalized to 0-100 scale)
    const rawScore = baseScore * countMultiplier * combinationBonus * criticalBonus;
    const normalizedScore = Math.min(100, (rawScore / 10) * 10);

    return Math.round(normalizedScore * 100) / 100;
  }

  /**
   * Helper to check if specific indicator combination exists
   */
  private static hasCombination(
    indicators: IndicatorScore[],
    targetIndicators: string[]
  ): boolean {
    // This is a simplified version - in production would check actual indicator IDs
    return indicators.length >= targetIndicators.length;
  }

  /**
   * Get ranking explanation/breakdown
   */
  static getRankingExplanation(
    score: number,
    indicators: IndicatorScore[]
  ): {
    score: number;
    level: string;
    breakdown: {
      indicatorCount: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
    };
    recommendation: string;
  } {
    const criticalCount = indicators.filter(i => i.severity === 'critical').length;
    const highCount = indicators.filter(i => i.severity === 'high').length;
    const mediumCount = indicators.filter(i => i.severity === 'medium').length;
    const lowCount = indicators.filter(i => i.severity === 'low').length;

    let level: string;
    let recommendation: string;

    if (score >= 75) {
      level = 'Urgent Priority';
      recommendation = 'Immediate investigation recommended - multiple strong indicators present';
    } else if (score >= 50) {
      level = 'High Priority';
      recommendation = 'Priority investigation recommended - significant indicators present';
    } else if (score >= 25) {
      level = 'Medium Priority';
      recommendation = 'Investigation warranted - review indicators carefully';
    } else {
      level = 'Lower Priority';
      recommendation = 'Further review may be needed depending on resources';
    }

    return {
      score,
      level,
      breakdown: {
        indicatorCount: indicators.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
      },
      recommendation,
    };
  }
}