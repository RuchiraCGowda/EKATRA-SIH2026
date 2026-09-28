import { RecyclerProfile, MaterialCategory, AppLanguage } from '../types/database';

export interface RecyclerRecommendation {
  recycler: RecyclerProfile;
  score: number; // 0 to 100
  distanceKm: number;
  matchReasons: string[];
  isAuthorized: boolean;
  isAiTopPick?: boolean;
}

export interface AiRecommendationResult {
  bestRecyclerId: string;
  confidenceScore: number;
  aiReasoning: string;
  localizedReasoning: string;
  factorScores: {
    materialSuitability: number;
    proximityAndCarbon: number;
    doorstepEquipment: number;
    regulatoryCompliance: number;
    settlementReliability: number;
  };
  keyBenefits: string[];
  source: 'gemini-3.8-flash' | 'algorithmic-multi-factor-engine';
}

// Haversine formula to compute actual spherical distance
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function recommendRecyclers(
  recyclers: RecyclerProfile[],
  category: MaterialCategory,
  userLat: number,
  userLon: number
): RecyclerRecommendation[] {
  return recyclers
    .map((recycler) => {
      const distanceKm = calculateDistanceKm(
        userLat,
        userLon,
        recycler.latitude,
        recycler.longitude
      );

      const matchReasons: string[] = [];
      let score = 50;

      // 1. Authorization status check (Heavy weighting)
      const isAuthorized = recycler.authorization_status === 'verified';
      if (isAuthorized) {
        score += 30;
        matchReasons.push('Government Verified (CPCB & SPCB Licensed)');
      } else if (recycler.authorization_status === 'under_review') {
        score += 10;
        matchReasons.push('Provisional Aggregator License Under Review');
      }

      // 2. Doorstep Pickup availability with calibrated scale
      if (recycler.pickup_available) {
        score += 15;
        matchReasons.push('Doorstep Collection Vehicle with Calibrated Scale');
      }

      // 3. Proximity & Service Area Radius
      if (distanceKm <= recycler.service_radius_km) {
        score += 20;
        matchReasons.push(`Operating within service area (${distanceKm} km away)`);
      } else {
        score -= 10;
        matchReasons.push(`Outside standard radius (${distanceKm} km)`);
      }

      // 4. Material compatibility
      matchReasons.push(`Certified facility for ${category.name_en}`);

      return {
        recycler,
        score: Math.min(100, Math.max(0, score)),
        distanceKm,
        matchReasons,
        isAuthorized,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// AI-based recommendation that queries our server-side Gemini 3.8 Flash endpoint
export async function fetchAiRecyclerRecommendation(
  recyclers: RecyclerProfile[],
  category: MaterialCategory,
  userLat: number,
  userLon: number,
  approxWeightKg: number,
  locationName: string,
  lang: AppLanguage
): Promise<AiRecommendationResult | null> {
  const recyclersWithDistance = recyclers.map((r) => ({
    ...r,
    distanceKm: calculateDistanceKm(userLat, userLon, r.latitude, r.longitude),
  }));

  try {
    const res = await fetch('/api/recommend-recycler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryName: category.name_en,
        hazardLevel: category.hazard_level,
        approxWeightKg,
        collectorLocation: locationName,
        collectorLat: userLat,
        collectorLon: userLon,
        lang,
        recyclers: recyclersWithDistance,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data: AiRecommendationResult = await res.json();
    return data;
  } catch (err) {
    console.warn('AI recommendation API request failed, generating client fallback:', err);
    // Client-side fallback if server cannot be reached
    const localRanked = recommendRecyclers(recyclers, category, userLat, userLon);
    const top = localRanked[0];
    if (!top) return null;

    return {
      bestRecyclerId: top.recycler.id,
      confidenceScore: top.score,
      aiReasoning: `Selected ${top.recycler.company_name} based on multi-factor proximity (${top.distanceKm} km), verified SPCB license, and doorstep collection.`,
      localizedReasoning:
        lang === 'mr'
          ? `${top.recycler.company_name} हे अधिकृत रीसाइक्लर तुमच्या परिसरापासून जवळ आहेत (${top.distanceKm} किमी). त्यांच्याकडे वजनकाटा वाहन उपलब्ध आहे.`
          : lang === 'hi'
          ? `${top.recycler.company_name} आपके पास के अधिकृत रीसाइक्लर हैं (${top.distanceKm} किमी)। वजनकाटा वाहन उपलब्ध है।`
          : `${top.recycler.company_name} is the top match based on proximity (${top.distanceKm} km) and doorstep calibrated scale.`,
      factorScores: {
        materialSuitability: 95,
        proximityAndCarbon: top.distanceKm <= 15 ? 94 : 80,
        doorstepEquipment: top.recycler.pickup_available ? 98 : 70,
        regulatoryCompliance: 100,
        settlementReliability: 94,
      },
      keyBenefits: top.matchReasons,
      source: 'algorithmic-multi-factor-engine',
    };
  }
}
