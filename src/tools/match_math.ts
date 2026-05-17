/**
 * 📊 MATCH MATHEMATICS ENGINE (TypeScript)
 * Performs real-time mathematical computations for win probability,
 * run rates, pressure indicators, and phase-specific analytics.
 */

export interface MatchState {
  venue: string;
  innings: number;
  target: number;
  score: number;
  wickets: number;
  over: number;
  batting_team: string;
  bowling_team: string;
  striker: string;
  non_striker: string;
  bowler: string;
  impact_player_available: boolean;
  pitch_condition: string;
  dew: string;
  bowlers_used: string;
}

export interface MathMetrics {
  currentRunRate: number;
  requiredRunRate: number;
  winProbabilityBatting: number;
  pressureIndex: number;
  verdict: string;
  phase: string;
}

export function computeWinPressureMatrix(
  innings: number,
  target: number,
  score: number,
  over: number,
  wickets: number = 4
): MathMetrics {
  const ballsBowled = Math.floor(over) * 6 + Math.round((over % 1) * 10);
  const ballsRemaining = Math.max(0, 120 - ballsBowled);

  // 1. Current Run Rate (CRR)
  const currentRunRate = score / (ballsBowled / 6 || 1);

  // 2. Required Run Rate (RRR)
  let requiredRunRate = 0;
  let winProbabilityBatting = 50;
  let verdict = "Evenly poised";

  if (innings === 2) {
    const runsNeeded = target - score;
    requiredRunRate = runsNeeded / (ballsRemaining / 6 || 1);

    if (runsNeeded <= 0) {
      winProbabilityBatting = 100;
      verdict = "Batting side has won!";
    } else if (ballsRemaining <= 0) {
      winProbabilityBatting = 0;
      verdict = "Bowling side has won!";
    } else {
      // Premium cricket win probability model
      const wicketsLeft = 10 - wickets;
      const ratio = requiredRunRate / (currentRunRate || 6.0);
      let rawProb = 100 - ratio * 40 + wicketsLeft * 3 - ballsRemaining * 0.1;
      winProbabilityBatting = Math.max(2, Math.min(98, Math.round(rawProb)));

      if (winProbabilityBatting > 75) verdict = "Batting side dominates";
      else if (winProbabilityBatting < 25) verdict = "Bowling side dominates";
      else if (requiredRunRate > 15) verdict = "Near-impossible chase";
      else verdict = "Tight match";
    }
  } else {
    // First innings math
    const projectedScore = currentRunRate * 20;
    winProbabilityBatting = 50;
    verdict = `First innings: Projecting ${Math.round(projectedScore)} runs`;
  }

  // 3. Pressure Index (0-100)
  const ratePressure = innings === 2 ? (requiredRunRate - currentRunRate) * 8 : 0;
  const wicketPressure = wickets * 8;
  const stagePressure = ballsBowled > 90 ? 15 : ballsBowled > 36 ? 5 : 0;
  const pressureIndex = Math.max(0, Math.min(100, Math.round(50 + ratePressure + wicketPressure - stagePressure)));

  // Determine active phase
  let phase = "PP"; // Powerplay
  if (ballsBowled > 90) {
    phase = "DEATH";
  } else if (ballsBowled > 36) {
    phase = "MID";
  }

  return {
    currentRunRate: parseFloat(currentRunRate.toFixed(2)),
    requiredRunRate: parseFloat(requiredRunRate.toFixed(2)),
    winProbabilityBatting,
    pressureIndex,
    verdict,
    phase
  };
}
