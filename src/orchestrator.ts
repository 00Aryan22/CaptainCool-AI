/**
 * 🏏 MULTI-AGENT ORCHESTRATOR (TypeScript)
 * Sequences the 5-phase sequential debate pipeline using Google Gemini 2.5.
 */

import type { MatchState, MathMetrics } from "./tools/match_math";
import { computeWinPressureMatrix } from "./tools/match_math";
import { scrapeLiveMatchIntelligence } from "./tools/venue_scraper";
import { AGENTS, CAPTAIN_DNA } from "./agents/agents";

export interface DebateResults {
  pitch_report: string;
  scout_report: string;
  plan_a: string;
  critique: string;
  final_call: string;
  broadcast: string;
  is_mock: boolean;
  metrics: MathMetrics;
}

export class Orchestrator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Helper to make a resilient call to the Gemini API
   */
  private async callAgent(
    model: string,
    systemPrompt: string,
    userMessage: string,
    temperature: number
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API Key is missing. Reverting to local simulation.");
    }

    // Translate model names to official API models
    const apiModel = model.includes("pro") ? "gemini-2.5-pro" : "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${this.apiKey}`;

    let lastError: any = null;
    // 3-Attempt Retry Loop for network resilience
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature, maxOutputTokens: 2048 }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty candidate response from Gemini API");
        return text;
      } catch (err: any) {
        lastError = err;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }

    // If pro model fails (quota exhausted), fallback to flash
    if (apiModel === "gemini-2.5-pro") {
      try {
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        const response = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature, maxOutputTokens: 2048 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        // Suppress and throw original error
      }
    }

    throw lastError || new Error("Failed after all retries");
  }

  /**
   * Main Execution Pipeline
   */
  public async run(matchState: MatchState, captainMode: string): Promise<DebateResults> {
    const metrics = computeWinPressureMatrix(
      matchState.innings,
      matchState.target,
      matchState.score,
      matchState.over,
      matchState.wickets
    );

    const venueReport = scrapeLiveMatchIntelligence(matchState.venue);

    try {
      // Phase 1: Environment Intelligence
      const pitchReport = await this.callAgent(
        AGENTS.pitchAnalyst.model,
        AGENTS.pitchAnalyst.systemPrompt,
        `Analyze venue: ${matchState.venue}. Metadata:\n${venueReport}`,
        AGENTS.pitchAnalyst.temperature
      );

      const scoutReport = await this.callAgent(
        AGENTS.dataScout.model,
        AGENTS.dataScout.systemPrompt,
        `Analyze metrics: innings=${matchState.innings}, target=${matchState.target}, score=${matchState.score}, over=${matchState.over}, wickets=${matchState.wickets}.\nComputed stats: ${JSON.stringify(metrics)}`,
        AGENTS.dataScout.temperature
      );

      const baseline = `VENUE REPORT:\n${pitchReport}\n\nMATHEMATICAL METRICS:\n${scoutReport}\n\nCURRENT STATE:\n${JSON.stringify(matchState)}`;

      // Phase 2: Plan A Proposal
      const planA = await this.callAgent(
        AGENTS.strategist.model,
        AGENTS.strategist.systemPrompt,
        `Based on this environmental telemetry, formulate Plan A for ${matchState.bowling_team}:\n\n${baseline}`,
        AGENTS.strategist.temperature
      );

      // Phase 3: Devil's Advocate Critique
      const critique = await this.callAgent(
        AGENTS.devilsAdvocate.model,
        AGENTS.devilsAdvocate.systemPrompt,
        `The Strategist proposes:\n\n${planA}\n\nTelemetry:\n${baseline}\n\nFind all tactical flaws, dew risks, boundaries vulnerabilities, and critique this plan aggressively!`,
        AGENTS.devilsAdvocate.temperature
      );

      // Phase 4: Reconciliation (Captain's Call)
      const captainInfo = CAPTAIN_DNA[captainMode];
      const reconciliationPrompt = `You are the Captain in ${captainMode} mode.\n${captainInfo.profile}\nAddress the Devil's Advocate's critiques, formulate your final definitive Captain's Call, specify a Counterfactual Metric, and state your confidence rating (0-100%).`;
      const finalCall = await this.callAgent(
        AGENTS.strategist.model,
        reconciliationPrompt,
        `Your Plan A:\n${planA}\n\nThe Critic's Feedback:\n${critique}\n\nContext:\n${baseline}\n\nDeliver your FINAL Captain's Call.`,
        AGENTS.strategist.temperature
      );

      // Phase 5: Broadcast Commentary Feed
      const broadcast = await this.callAgent(
        AGENTS.commentator.model,
        AGENTS.commentator.systemPrompt,
        `Match: ${matchState.batting_team} vs ${matchState.bowling_team}\nScore: ${matchState.score}/${matchState.wickets} in Over ${matchState.over}\nTarget: ${matchState.target}\n\nTHE CAPTAIN'S CALL:\n${finalCall}`,
        AGENTS.commentator.temperature
      );

      return {
        pitch_report: pitchReport,
        scout_report: scoutReport,
        plan_a: planA,
        critique: critique,
        final_call: finalCall,
        broadcast: broadcast,
        is_mock: false,
        metrics
      };

    } catch (error) {
      console.warn("Orchestrator failed. Activating High-Fidelity Strategic Local Simulation Fallback:", error);
      return this.generateMockResults(matchState, captainMode, metrics, venueReport);
    }
  }

  /**
   * Generates highly detailed, realistic mock debate transcripts matching each captain's DNA
   */
  private generateMockResults(
    matchState: MatchState,
    captainMode: string,
    metrics: MathMetrics,
    venueReport: string
  ): DebateResults {
    const captainInfo = CAPTAIN_DNA[captainMode];
    console.log("Mock execution initialized with venue metadata:", venueReport);
    let planA = `### Captain DNA: ${captainInfo.title}\n\n`;
    let critique = "";
    let finalCall = "";
    let broadcast = "";

    if (captainMode === "Dhoni") {
      planA = `### MS Dhoni's Ice-Cold Plan A
1. **Bowling Instruction:** Ask ${matchState.bowler} to bowl slow, wide off-cutters away from ${matchState.striker}'s reach. Do not offer pace on this wicket.
2. **Spin Choke:** Bring spinners into play immediately. Keep long-on and long-off deep to prevent easy boundaries.
3. **Deep Game Focus:** Allow singles. Do not panic even if 12 runs are needed per over. Pressure will make the batsman crash.`;

      critique = `### Cycnical Assistant Coach's Critique
*   **Wide Outfield Dew:** The ball has gathered significant moisture; spin cutters will skid instead of gripping. Wide lines could turn into easy boundary options.
*   **Striker Form:** ${matchState.striker} has strong square cut shots; short wide deliveries will be slashed over point boundaries!`;

      finalCall = `### 🏆 MS Dhoni's Final Decision (Reconciliation)
*   **Reconciliation:** I hear you about the dew. Spin cutters might skid, so we swap to seam-up cutters on a heavy length.
*   **Field Setup:** Move point deep to third-man. Bring extra-cover inside the circle.
*   **Counterfactual Metric:** If we concede less than 8 runs this over, win probability scales to **${Math.min(95, metrics.winProbabilityBatting + 15)}%**.
*   **Confidence Rating:** 88%`;

      broadcast = `"Well, folks! Dhoni has taken it deep again! Point deepens to third-man, the bowler bounds in, slashes it short and it's a DOT BALL! Magnificent tactician, ice in his veins!"`;
    } else if (captainMode === "Rohit") {
      planA = `### Rohit Sharma's Matchup Strategy
1. **Bowling Action:** Match up ${matchState.bowler}'s release angle against ${matchState.striker}'s weak zone (short pitch into the ribs).
2. **Ring Protection:** Two slips in place. Guard the square boundary gaps.
3. **Hard Lengths:** Keep bowling hard lengths at 140+ kph.`;

      critique = `### Cycnical Assistant Coach's Critique
*   **Boundary Trap:** Straight boundaries are very short at this venue. If the fast bowler misses by an inch, it will fly straight over his head for six.
*   **Non-Striker Danger:** ${matchState.non_striker} is a strong straight hitter, ready to exploit mid-off holes.`;

      finalCall = `### 🏆 Rohit Sharma's Final Decision (Reconciliation)
*   **Reconciliation:** Correct. Straight boundaries are vulnerable. We'll pull mid-on back and bowl yorkers outside off-stump instead of short length.
*   **Counterfactual Metric:** Keeping boundary lengths over 70m active.
*   **Confidence Rating:** 91%`;

      broadcast = `"Target locked! Rohit has shifted his slips to deep third-man! Yorkers coming up! It's a absolute beauty, dug out by the striker! Matchup perfection!"`;
    } else {
      planA = `### Gautam Gambhir's Aggressive Blueprint
1. **Attacking Spin:** Spinners bowling close to the stumps.
2. **Aggressive Fields:** Two catching short-covers, silly mid-off in place.
3. **Run Suffocation:** Deny every single. Make every run feel like a mountain.`;

      critique = `### Cycnical Assistant Coach's Critique
*   **Overthrow Risk:** High pressure field settings will lead to quick singles and hurried throws.
*   **Pace Acceleration:** Attacking field exposes massive gaps at deep mid-wicket.`;

      finalCall = `### 🏆 Gautam Gambhir's Final Decision (Reconciliation)
*   **Reconciliation:** We will NOT pull back. Catchers stay in! Let them try to hit over the top on this spinner-friendly pitch.
*   **Counterfactual Metric:** If wickets fall this over, win probability jumps by **20%**.
*   **Confidence Rating:** 95%`;

      broadcast = `"This is absolute war! Gambhir has close-in fielders breathing down the striker's neck! Spin bowls, batsman is choked for room! What a contest!"`;
    }

    return {
      pitch_report: `🏟️ Pitch analysis for ${matchState.venue} highlights moderate grass moisture (${matchState.pitch_condition} track). Boundaries are short on square dimensions. Defending team has historical matchup advantage.`,
      scout_report: `📊 Numerical Telemetry: Current Run Rate is ${metrics.currentRunRate}. Required Run Rate is ${metrics.requiredRunRate}. Wickets lost: ${matchState.wickets}. Pressure Index stands at ${metrics.pressureIndex} (${metrics.verdict}).`,
      plan_a: planA,
      critique: critique,
      final_call: finalCall,
      broadcast: broadcast,
      is_mock: true,
      metrics
    };
  }
}
