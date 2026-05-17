# 🏆 CaptainCool AI — IPL Multi-Agent Strategy Swarm 🏏

[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Vite](https://img.shields.io/badge/Vite-v8.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-v19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Google Gemini API](https://img.shields.io/badge/Powered%20By-Google%20Gemini%202.5-orange?style=for-the-badge&logo=google)](https://ai.google.dev)

Welcome to **CaptainCool AI**, an elite multi-agent swarm platform that simulates professional Indian Premier League (IPL) captain decisions in real-time. Engineered for high-stakes, national-level hackathons, this platform transforms raw match statistics, soil conditions, stadium dimensions, and environmental metrics into perfect strategic bowling and fielding blueprints.

---

## 🎨 Interactive Live Dashboard Preview
The application is structured as a premium **Single-Page Application** featuring a deep-space glassmorphism visual system, glowing borders, custom HSL range selectors, and maximum contrast accessibility.

![CaptainCool Cover Art](/cover_art.png)

---

## 🧠 Cybernetic Swarm Architecture
The strategic decisions are reached through a sequential five-agent consensus swarm:

```
🏟️ Pitch Analyst ──► 📊 Data Scout ──► 🧠 Plan A Proposal ──► 😈 Devil's Advocate ──► 🏆 Captain's Call
    (Flash)              (Flash)             (Pro 2.5)            (Pro 2.5)            (Pro 2.5)
```

1. **🏟️ Phase 1: Environment Intelligence (Pitch Analyst):** Compiles boundaries, weather telemetry, soil records, and dew factor.
2. **📊 Phase 2: Numerical Synthesis (Data Scout):** Computes cricket-specific mathematical run rates and win probability telemetry.
3. **🧠 Phase 3: Plan A Proposal (Strategist):** Formulates the baseline strategy optimized for the chosen bowling team and bowler matchups.
4. **😈 Phase 4: Stress-Testing Critique (Devil's Advocate):** Systematically analyzes Plan A for boundary slips, dew skids, striker zones, and matches.
5. **🏆 Phase 5: Captain's Reconciliation (Captain Mode):** Addresses critiques under a specific Captain persona DNA (Dhoni, Rohit, or Gambhir), outputting the definitive Captain's Call, a **Counterfactual Metric**, and a confidence rating.
6. **🎙️ Phase 6: Broadcast commentary feed:** Harsha Bhogle / Ravi Shastri style commentator reports the action live.

---

## 📊 Embedded Match Mathematics
The platform runs real-time mathematical simulation equations in TypeScript:
* **Current Run Rate (CRR):**
  $$\text{CRR} = \frac{\text{Runs Scored}}{\text{Balls Bowled} / 6}$$
* **Required Run Rate (RRR) [2nd Innings]:**
  $$\text{RRR} = \frac{\text{Target} - \text{Runs Scored}}{\text{Balls Remaining} / 6}$$
* **Pressure Index (0-100%):**
  $$\text{Pressure} = \text{Clamp}\left(0, 100, 50 + (\text{RRR} - \text{CRR}) \times 8 + (\text{Wickets} \times 8) - \text{Stage Offset}\right)$$

---

## 🏟️ Pre-loaded Stadium Intelligence
The platform contains telemetry for major Indian stadiums:
* **Wankhede Stadium (Mumbai):** Red soil, high spin grip, very short square boundaries (64m).
* **M. Chinnaswamy Stadium (Bengaluru):** Flat batting track, high altitude, short boundaries (60m).
* **MA Chidambaram Stadium (Chepauk, Chennai):** Sticky clay, low bounce, spin heaven, long straight boundaries (78m).
* **Eden Gardens (Kolkata):** Fast grassy turf, lightning outfield, high scores.
* **Arun Jaitley Stadium (Delhi):** Dry black soil, sluggish low bounce.
* **Narendra Modi Stadium (Ahmedabad):** Giant boundaries, mixed soil.

---

## 🛠️ Local Development & Setup

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** or **yarn**

### Quickstart Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd APL
   ```
2. Install all core dependencies:
   ```bash
   npm install
   ```
3. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. To build the production bundle:
   ```bash
   npm run build
   ```

---

## 🚀 Easy Vercel Deployment
Deploying to Vercel is fully automated with zero configuration:
1. Connect your GitHub repository to Vercel.
2. Select **Vite** as the framework template.
3. Click **Deploy**! The SPA operates client-side with secure local session state for API keys.
