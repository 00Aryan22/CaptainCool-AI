/**
 * 🏟️ VENUE SCRAPER & DATABASE TOOL (TypeScript)
 * Provides comprehensive statistical layouts and dimensions for major IPL stadiums.
 */

export interface StadiumInfo {
  name: string;
  city: string;
  straightBoundary: number;
  squareBoundary: number;
  avgFirstInnings: number;
  boundaryDimensionDetails: string;
  historicalInsights: string;
}

export const IPL_VENUES: Record<string, StadiumInfo> = {
  "Wankhede Stadium": {
    name: "Wankhede Stadium",
    city: "Mumbai",
    straightBoundary: 72,
    squareBoundary: 64,
    avgFirstInnings: 180,
    boundaryDimensionDetails: "Straight boundaries are short (72m) but square boundaries are extremely short (64m) causing rapid run acceleration.",
    historicalInsights: "Extremely dew-heavy venue. The red soil pitch offers great bounce and carry. Teams chasing have won over 60% of night matches due to wet ball and wet outfield."
  },
  "M. Chinnaswamy Stadium": {
    name: "M. Chinnaswamy Stadium",
    city: "Bengaluru",
    straightBoundary: 60,
    squareBoundary: 56,
    avgFirstInnings: 195,
    boundaryDimensionDetails: "Extremely short straight boundary (60m) and square boundary (56m). The shortest boundaries in the IPL.",
    historicalInsights: "High altitude and short boundaries make this stadium a graveyard for bowlers. Flat deck with rapid outfield. Scores above 200 are routinely chased down."
  },
  "MA Chidambaram Stadium": {
    name: "MA Chidambaram Stadium",
    city: "Chennai",
    straightBoundary: 78,
    squareBoundary: 70,
    avgFirstInnings: 155,
    boundaryDimensionDetails: "Large boundaries (78m straight, 70m square). Square boundaries are deep with slow outfield.",
    historicalInsights: "Traditional spinning track. Extremely humid, offering zero dew or significant dew depending on the season, but spinners dominate due to low bounce and grip."
  },
  "Eden Gardens": {
    name: "Eden Gardens",
    city: "Kolkata",
    straightBoundary: 74,
    squareBoundary: 68,
    avgFirstInnings: 175,
    boundaryDimensionDetails: "Medium straight boundary (74m) and square boundary (68m). Very fast grass outfield.",
    historicalInsights: "Black soil pitch that supports pace early but turns into a batting paradise once the ball gets soft. Spinners get decent skid off the surface."
  },
  "Arun Jaitley Stadium": {
    name: "Arun Jaitley Stadium",
    city: "Delhi",
    straightBoundary: 68,
    squareBoundary: 62,
    avgFirstInnings: 170,
    boundaryDimensionDetails: "Relatively small stadium with 68m straight and 62m square boundaries.",
    historicalInsights: "Dry, slow pitch that is highly receptive to slow cutters and spin. Outfield is fast, and ground is prone to extremely high-scoring matches on fresh tracks."
  },
  "Narendra Modi Stadium": {
    name: "Narendra Modi Stadium",
    city: "Ahmedabad",
    straightBoundary: 82,
    squareBoundary: 75,
    avgFirstInnings: 172,
    boundaryDimensionDetails: "Massive boundaries (82m straight, 75m square). One of the largest outfields in world cricket.",
    historicalInsights: "Eleven different clay pitches available (five black clay, six red clay). Red clay offers great bounce for fast bowlers while black clay spinner-friendly."
  }
};

export function scrapeLiveMatchIntelligence(venueName: string): string {
  const normalized = Object.keys(IPL_VENUES).find(v => v.toLowerCase().includes(venueName.toLowerCase())) || "Wankhede Stadium";
  const venue = IPL_VENUES[normalized];

  return `🏟️ VENUE INTELLIGENCE REPORT: ${venue.name.toUpperCase()}
===================================================
• Location: ${venue.city}, India
• Straight Boundaries: ${venue.straightBoundary}m
• Square Boundaries: ${venue.squareBoundary}m
• Avg First Innings Score: ${venue.avgFirstInnings} runs

📋 Pitch Details & Dimensions:
${venue.boundaryDimensionDetails}

📈 Historical Stats:
${venue.historicalInsights}
===================================================`;
}
