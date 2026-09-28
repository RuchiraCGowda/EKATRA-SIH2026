import { Lot, PriceRecord, AnomalySeverity } from '../types/database';

export interface AnomalyEvaluation {
  hasAnomaly: boolean;
  ruleTriggered?: string;
  severity: AnomalySeverity;
  details?: string;
}

export function evaluateLotAnomaly(lot: Lot, benchmarkPrice?: PriceRecord): AnomalyEvaluation {
  // Rule 1: Extreme Price Deviation
  if (benchmarkPrice && lot.agreed_rate_per_kg) {
    const min = benchmarkPrice.market_min_price;
    const max = benchmarkPrice.market_max_price;

    if (lot.agreed_rate_per_kg > max * 1.5) {
      return {
        hasAnomaly: true,
        ruleTriggered: 'Unusual High Rate Outlier',
        severity: 'high',
        details: `Quoted rate of ₹${lot.agreed_rate_per_kg}/kg exceeds verified market ceiling of ₹${max}/kg by over 50%. Transaction requires review.`,
      };
    }

    if (lot.agreed_rate_per_kg < min * 0.6) {
      return {
        hasAnomaly: true,
        ruleTriggered: 'Sub-Market Undervaluation Warning',
        severity: 'medium',
        details: `Offered rate of ₹${lot.agreed_rate_per_kg}/kg is significantly below market floor of ₹${min}/kg. May indicate middleman extraction.`,
      };
    }
  }

  // Rule 2: Unusually High Weight for Single Informal Lot
  if (lot.approx_weight_kg > 1500) {
    return {
      hasAnomaly: true,
      ruleTriggered: 'Excess Single Lot Weight',
      severity: 'medium',
      details: `Declared weight of ${lot.approx_weight_kg} kg exceeds single collector transport threshold. Physical aggregator verification suggested.`,
    };
  }

  // Rule 3: Extreme discrepancy between initial estimate and final sale
  if (lot.final_sale_value_inr && lot.estimated_value_inr) {
    const diffRatio = Math.abs(lot.final_sale_value_inr - lot.estimated_value_inr) / lot.estimated_value_inr;
    if (diffRatio > 0.4) {
      return {
        hasAnomaly: true,
        ruleTriggered: 'Handover Value Variance',
        severity: 'low',
        details: `Difference of ${(diffRatio * 100).toFixed(0)}% between initial valuation and final handover payout. Transaction requires review.`,
      };
    }
  }

  return {
    hasAnomaly: false,
    severity: 'low',
  };
}
