import React, { useState, useEffect } from "react";
import type { MatchState } from "./tools/match_math";
import { computeWinPressureMatrix } from "./tools/match_math";
import { Orchestrator } from "./orchestrator";
import type { DebateResults } from "./orchestrator";
import { CAPTAIN_DNA } from "./agents/agents";
import { IPL_VENUES } from "./tools/venue_scraper";
import "./App.css";

type TabName = "command" | "debate" | "analytics" | "toolbox" | "settings";

function App() {
  // ── Tab Navigation State ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabName>("command");

  // ── Core State Variables ─────────────────────────────────────
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("GEMINI_API_KEY") || "AIzaSyCsQYDj-zwjwS9IqINCSesyLJ6PFFfk0wg";
  });

  const [venue, setVenue] = useState<string>("MA Chidambaram Stadium");
  const [innings, setInnings] = useState<number>(2);
  const [score, setScore] = useState<number>(145);
  const [wickets, setWickets] = useState<number>(4);
  const [over, setOver] = useState<number>(15.2);
  const [target, setTarget] = useState<number>(195);

  const [battingTeam, setBattingTeam] = useState<string>("RCB");
  const [bowlingTeam, setBowlingTeam] = useState<string>("CSK");
  const [striker, setStriker] = useState<string>("Virat Kohli");
  const [nonStriker, setNonStriker] = useState<string>("Dinesh Karthik");
  const [bowler, setBowler] = useState<string>("Matheesha Pathirana");

  const [pitchCondition, setPitchCondition] = useState<string>("Turning");
  const [dew, setDew] = useState<string>("None");
  const [bowlersUsed, setBowlersUsed] = useState<string>("Bumrah: 3\nPathirana: 3\nJadeja: 4\n");

  const [captainMode, setCaptainMode] = useState<string>("Dhoni");

  // ── Swarm Engine States ──────────────────────────────────────
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePhase, setActivePhase] = useState<number>(0);
  const [results, setResults] = useState<DebateResults | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // ── Chat Input Inquiries ────────────────────────────────────
  const [chatInquiry, setChatInquiry] = useState<string>("");
  const [customInquiries, setCustomInquiries] = useState<Array<{ sender: string; msg: string; type: string }>>([]);

  // ── Save API Key locally ───────────────────────────────────
  useEffect(() => {
    localStorage.setItem("GEMINI_API_KEY", apiKey);
  }, [apiKey]);

  // ── Auto-Run Default Initial State on Chidambaram ──
  useEffect(() => {
    const initialMetrics = computeWinPressureMatrix(innings, target, score, over, wickets);
    const mockRes: DebateResults = {
      pitch_report: `🏟️ Pitch analysis for ${venue} highlights a high spin index (${pitchCondition} turf). Boundaries are moderate (68m straight, 64m square), giving defensive spin methods absolute structural matchups.`,
      scout_report: `📊 Numerical Telemetry: CRR is ${initialMetrics.currentRunRate}. Required Run Rate is ${initialMetrics.requiredRunRate}. Wickets lost: ${wickets}. Pressure Index stands at ${initialMetrics.pressureIndex} (${initialMetrics.verdict}).`,
      plan_a: `### MS Dhoni's Strategic Proposal
1. **Matchup Focus:** Exploit the striker's low strike rate (88.4) against leg spin on turning pitches.
2. **Bowling Tactic:** Bring in a spinner (e.g., Rashid Khan/Jadeja) to bowl flat cutters outside off stump.
3. **Field Shield:** Keep deep mid-wicket and long-on active to minimize boundaries.`,
      critique: `### Devil's Advocate Stress-Test
* **Dew Vulnerability:** The ball is picking up light surface moisture. Spin grip will decay rapidly.
* **Length Risk:** If the spinner misses the length by 3 inches, the batsman will sweep over square boundary.`,
      final_call: `🏆 MS Dhoni's Reconciled Captain's Call:
"We will stick to leg-spin but adjust bowling lines. Rashid/Jadeja bowls flatter, seam-up cutters to counter dew. Field setup: deep mid-wicket stays deep, cover point brought inside the circle."`,
      broadcast: `“Absolute tactical genius! Dhoni signals the spinner, fieldsmen retreat, and the batsman is completely choked for room! What a breakthrough recommendation!”`,
      is_mock: true,
      metrics: initialMetrics
    };
    setResults(mockRes);
  }, []);

  // ── Compute Live Metrics ───────────────────────────────────
  const liveMetrics = computeWinPressureMatrix(innings, target, score, over, wickets);

  // ── Trigger Swarm Simulation ────────────────────────────────
  const handleSimulate = async () => {
    setIsLoading(true);
    setResults(null);
    setActiveTab("command"); // view output directly on command dashboard
    
    const matchState: MatchState = {
      venue,
      innings,
      target,
      score,
      wickets,
      over,
      batting_team: battingTeam,
      bowling_team: bowlingTeam,
      striker,
      non_striker: nonStriker,
      bowler,
      impact_player_available: false,
      pitch_condition: pitchCondition,
      dew,
      bowlers_used: bowlersUsed
    };

    const orchestrator = new Orchestrator(apiKey);

    // Dynamic Step Sequence Timing
    setActivePhase(1);
    await new Promise(r => setTimeout(r, 700));
    setActivePhase(2);
    await new Promise(r => setTimeout(r, 700));
    setActivePhase(3);
    await new Promise(r => setTimeout(r, 700));
    setActivePhase(4);
    await new Promise(r => setTimeout(r, 700));
    setActivePhase(5);

    try {
      const res = await orchestrator.run(matchState, captainMode);
      setResults(res);
      
      setHistory(prev => [
        {
          over,
          score: `${score}/${wickets}`,
          captain: captainMode,
          call: res.final_call
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setActivePhase(0);
    }
  };

  // ── Handle Custom Inquiry Form ──────────────────────────────
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInquiry.trim()) return;

    const userQuestion = chatInquiry;
    setChatInquiry("");

    // Append user question
    setCustomInquiries(prev => [
      ...prev,
      { sender: "You", msg: userQuestion, type: "user" }
    ]);

    // Append a temporary loading bubble
    setCustomInquiries(prev => [
      ...prev,
      { 
        sender: `Strategist (${captainMode} DNA)`, 
        msg: "🔄 Lead AI is compiling live scoreboard metrics and historic decision matrices to formulate your answer...", 
        type: "lead-loading" 
      }
    ]);

    const matchState: MatchState = {
      venue,
      innings,
      target,
      score,
      wickets,
      over,
      batting_team: battingTeam,
      bowling_team: bowlingTeam,
      striker,
      non_striker: nonStriker,
      bowler,
      impact_player_available: false,
      pitch_condition: pitchCondition,
      dew,
      bowlers_used: bowlersUsed
    };

    try {
      const orchestrator = new Orchestrator(apiKey);
      const reply = await orchestrator.askQuestion(userQuestion, matchState, captainMode, history);

      // Replace the loading bubble with the actual AI response
      setCustomInquiries(prev => {
        const filtered = prev.filter(c => c.type !== "lead-loading");
        return [
          ...filtered,
          { sender: `Strategist (${captainMode} DNA)`, msg: reply, type: "lead" }
        ];
      });
    } catch (err) {
      console.error(err);
      setCustomInquiries(prev => {
        const filtered = prev.filter(c => c.type !== "lead-loading");
        return [
          ...filtered,
          { 
            sender: `Strategist (${captainMode} DNA)`, 
            msg: `⚠️ Connection to captain swarm interrupted. Under Dhoni's Ice-Cold doctrine, I suggest maintaining current field placements for Over ${over}.`, 
            type: "lead" 
          }
        ];
      });
    }
  };

  // ── Execute recommendation action ───────────────────────────
  const handleExecuteDecision = () => {
    alert(`Decision successfully dispatched! Bowling configuration synchronized to: ${bowler} / Spin Matchup.`);
  };

  // ── Retrieve Active Captain profile from agents list ────────
  const activeCaptainProfile = CAPTAIN_DNA[captainMode as keyof typeof CAPTAIN_DNA] || {
    emoji: "🏏",
    profile: "Standard tactical matchup profiles active."
  };

  return (
    <div className="bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      {/* ════════════════════════════════════════════════════════
         TOP HEADER NAVIGATION BAR
         ════════════════════════════════════════════════════════ */}
      <header className="bg-surface/80 top-0 sticky backdrop-blur-xl border-b border-primary/30 shadow-[0_0_15px_rgba(76,214,255,0.2)] z-50">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4">
          <div className="flex items-center gap-6">
            <span className="text-headline-md font-black tracking-tighter text-primary uppercase">
              CRICKET AI COMMAND
            </span>
            <div className="hidden md:flex items-center gap-4 text-on-surface-variant">
              <span className="text-label-sm px-3 py-1 bg-surface-container rounded-full border border-outline-variant/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> 
                LIVE: {venue.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold tracking-widest text-[#f72585] bg-[#f72585]/10 border border-[#f72585]/30 px-3 py-1 rounded">
              {apiKey ? "🔴 GEMINI ACTIVE" : "⚡ SIMULATOR fallback"}
            </span>
            <button className="material-symbols-outlined text-primary hover:bg-primary/10 transition-colors p-2 rounded-full">
              notifications
            </button>
            <button className="material-symbols-outlined text-primary hover:bg-primary/10 transition-colors p-2 rounded-full">
              hub
            </button>
            <button className="material-symbols-outlined text-primary hover:bg-primary/10 transition-colors p-2 rounded-full">
              account_circle
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-72px)]">
        {/* ════════════════════════════════════════════════════════
           LEFT SIDEBAR NAVIGATION
           ════════════════════════════════════════════════════════ */}
        <aside className="bg-surface-container-low/90 w-64 rounded-r-xl border-r border-primary/20 shadow-2xl flex flex-col py-6">
          <div className="px-6 mb-8">
            <h2 className="text-headline-md font-black text-primary uppercase">Strategist AI</h2>
            <p className="text-body-md text-on-surface-variant opacity-60">Swarm Active (v3.4)</p>
          </div>

          <nav className="flex-1 space-y-2">
            <div 
              className={`rounded-lg mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${activeTab === "command" ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(76,214,255,0.2)]" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"}`}
              onClick={() => setActiveTab("command")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-body-md font-semibold">Match Command</span>
            </div>

            <div 
              className={`rounded-lg mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${activeTab === "debate" ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(76,214,255,0.2)]" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"}`}
              onClick={() => setActiveTab("debate")}
            >
              <span className="material-symbols-outlined">forum</span>
              <span className="font-body-md font-semibold">Agent Debate</span>
            </div>

            <div 
              className={`rounded-lg mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${activeTab === "analytics" ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(76,214,255,0.2)]" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"}`}
              onClick={() => setActiveTab("analytics")}
            >
              <span className="material-symbols-outlined">query_stats</span>
              <span className="font-body-md font-semibold">Live Analytics</span>
            </div>

            <div 
              className={`rounded-lg mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${activeTab === "toolbox" ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(76,214,255,0.2)]" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"}`}
              onClick={() => setActiveTab("toolbox")}
            >
              <span className="material-symbols-outlined">construction</span>
              <span className="font-body-md font-semibold">Toolbox Intel</span>
            </div>

            <div 
              className={`rounded-lg mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${activeTab === "settings" ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(76,214,255,0.2)]" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-body-md font-semibold">Config Setup</span>
            </div>
          </nav>

          <div className="px-4 mt-auto">
            <button 
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold tracking-widest text-label-sm uppercase hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              {isLoading ? "THINKING SWARM..." : "INITIATE SIMULATION"}
            </button>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════════
           MAIN WORKSPACE & THREE-COLUMN VIEWS
           ════════════════════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto px-6 py-8 pitch-texture flex flex-col gap-6">
          
          {/* Live Match State Banner */}
          <div className="glass-panel rounded-xl p-6 border-l-4 border-secondary flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-label-sm text-secondary uppercase tracking-widest mb-1">Current Score</p>
                <h3 className="text-headline-lg font-black text-on-surface">{score} / {wickets}</h3>
              </div>
              <div className="h-12 w-px bg-outline-variant/30"></div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase mb-1">Overs</p>
                <h3 className="text-headline-lg font-black text-on-surface">{over}</h3>
              </div>
              <div className="h-12 w-px bg-outline-variant/30"></div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase mb-1">Target</p>
                <h3 className="text-headline-lg font-black text-[#f72585]">{innings === 2 ? target : "N/A (1st Innings)"}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-surface-container-highest/50 px-6 py-3 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">stadium</span>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase">Stadium Venue</p>
                <p className="text-body-md font-bold">{venue}</p>
              </div>
              <span className="text-label-sm px-2 py-0.5 bg-tertiary/20 text-tertiary border border-tertiary/30 rounded uppercase font-bold">
                {pitchCondition} Pitch
              </span>
            </div>
          </div>

          {/* Dynamic Active Agent Thinking Indicator */}
          {isLoading && (
            <div className="glass-panel rounded-xl p-6 border-l-4 border-[#f72585] bg-surface-container-highest/20 animate-pulse flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#f72585]/10 flex items-center justify-center border border-[#f72585]/30">
                <span className="material-symbols-outlined text-[#f72585] animate-spin">sync</span>
              </div>
              <div>
                <h4 className="text-md font-bold text-white uppercase tracking-wider">
                  Swarm consensus pipeline actively processing...
                </h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  {activePhase === 1 && "🏟️ Phase 1: Environment Intelligence (Pitch Scraper compiling turf data)"}
                  {activePhase === 2 && "📊 Phase 2: Numerical Synthesis (Data Scout calculating run rates)"}
                  {activePhase === 3 && "🧠 Phase 3: Strategic Proposal (Lead AI formulating Plan A match plan)"}
                  {activePhase === 4 && "😈 Phase 4: Stress-Testing Critique (Devil's Advocate analyzing boundary limits)"}
                  {activePhase === 5 && "🏆 Phase 5: Reconciling captain's command and broadcasting feed"}
                </p>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              ROUTE CONTROLLER VIEW SWITCHER
              ──────────────────────────────────────────────────────── */}

          {/* TAB 1: MATCH COMMAND CENTER */}
          {activeTab === "command" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left & Middle Column (Strategy recommendations & reasoning) */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* The Call Hero Card */}
                {results ? (
                  <div className="relative overflow-hidden rounded-xl bg-surface-container-high border border-primary/30 group">
                    <div className="absolute inset-0 gemini-gradient opacity-10"></div>
                    <div className="p-8 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary animate-pulse">bolt</span>
                        <span className="text-label-sm text-primary uppercase tracking-[0.2em]">Priority Recommendation ({captainMode})</span>
                      </div>
                      
                      <h1 className="text-3xl font-black text-on-surface mb-6 leading-tight">
                        {results.final_call.includes("Captain's Call:") 
                          ? results.final_call.split("Captain's Call:")[1].trim().replace(/^"/, '').replace(/"$/, '').slice(0, 120) + "..."
                          : results.final_call.slice(0, 140) + "..."}
                      </h1>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleExecuteDecision}
                          className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(76,214,255,0.4)]"
                        >
                          EXECUTE DECISION <span className="material-symbols-outlined">trending_flat</span>
                        </button>
                        <button 
                          onClick={() => setResults(null)}
                          className="px-8 py-3 bg-transparent border border-outline text-on-surface font-bold rounded-lg hover:bg-surface-variant transition-all"
                        >
                          DISMISS
                        </button>
                      </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"></div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface-container-high border border-outline-variant/30 p-8 text-center">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4 animate-bounce">rocket</span>
                    <h3 className="text-xl font-bold">Strategy engine ready</h3>
                    <p className="text-on-surface-variant opacity-70 mt-2">
                      Please adjust the match parameters and hit "INITIATE SIMULATION" to formulate real-time strategic recommendations.
                    </p>
                  </div>
                )}

                {/* The Reasoning Box */}
                {results && (
                  <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-4">
                      <span className="material-symbols-outlined text-secondary">psychology</span>
                      <h4 className="text-headline-md font-bold">The Strategic Rationale</h4>
                    </div>
                    <div className="text-body-lg text-on-surface-variant leading-relaxed">
                      "{results.final_call}"
                    </div>
                  </div>
                )}

                {/* The Agentic War Room Chat */}
                <div className="glass-panel rounded-xl flex flex-col h-[500px]">
                  <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-highest/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">diversity_3</span>
                      <h4 className="text-label-sm font-bold uppercase tracking-widest">Agentic Swarm War Room</h4>
                    </div>
                    <span className="text-label-sm text-secondary bg-secondary/10 px-2 py-1 rounded font-bold">
                      {results ? "DEBATE COMPLETE" : "READY"}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Standard static debate intro if no custom inquiries */}
                    {results && (
                      <>
                        {/* Stats Analyst */}
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-md">
                            <span className="material-symbols-outlined text-on-primary-container">query_stats</span>
                          </div>
                          <div className="bg-surface-container rounded-2xl rounded-tl-none p-4 max-w-[85%] border border-outline-variant/20 shadow-sm">
                            <p className="text-label-sm text-primary-fixed-dim mb-1 font-bold">Data Scout (Math Analyst)</p>
                            <p className="text-body-md leading-relaxed">{results.scout_report}</p>
                          </div>
                        </div>

                        {/* Devil's Advocate */}
                        <div className="flex gap-4 flex-row-reverse">
                          <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0 shadow-md">
                            <span className="material-symbols-outlined text-on-error-container">warning</span>
                          </div>
                          <div className="bg-surface-container rounded-2xl rounded-tr-none p-4 max-w-[85%] border border-error/20 shadow-sm text-right">
                            <p className="text-label-sm text-error mb-1 font-bold text-right font-black">Devil's Advocate</p>
                            <p className="text-body-md leading-relaxed">{results.critique}</p>
                          </div>
                        </div>

                        {/* Strategist */}
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full gemini-gradient flex items-center justify-center shrink-0 shadow-md">
                            <span className="material-symbols-outlined text-on-primary font-bold">voice_selection</span>
                          </div>
                          <div className="bg-surface-container-high rounded-2xl rounded-tl-none p-4 max-w-[85%] border border-primary/40 shadow-lg">
                            <p className="text-label-sm text-secondary mb-1 font-bold">Strategist Lead AI ({captainMode} DNA)</p>
                            <p className="text-body-md leading-relaxed">{results.plan_a}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Rendering Custom Inquiry Responses */}
                    {customInquiries.map((inq, idx) => (
                      <div key={idx} className={`flex gap-4 ${inq.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${inq.type === 'user' ? 'bg-primary-container' : 'gemini-gradient'}`}>
                          <span className="material-symbols-outlined text-on-primary-container">
                            {inq.type === 'user' ? 'account_circle' : 'psychology'}
                          </span>
                        </div>
                        <div className={`rounded-2xl p-4 max-w-[85%] border shadow-sm ${inq.type === 'user' ? 'bg-surface-container border-outline-variant/30 text-right rounded-tr-none' : 'bg-surface-container-high border-primary/30 rounded-tl-none'}`}>
                          <p className="text-label-sm text-primary mb-1 font-bold">{inq.sender}</p>
                          <div className="text-body-md whitespace-pre-wrap text-left leading-relaxed">{inq.msg}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendInquiry} className="p-4 border-t border-outline-variant/30 flex gap-2 bg-surface-container-low/40">
                    <input 
                      className="flex-1 bg-surface-container-low border-2 border-outline-variant/40 rounded-lg text-body-md px-4 py-2 text-white focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/40" 
                      placeholder={`Ask Captain ${captainMode} AI a specific strategic question...`} 
                      type="text"
                      value={chatInquiry}
                      onChange={(e) => setChatInquiry(e.target.value)}
                    />
                    <button type="submit" className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Sidebar Dashboard Column */}
              <div className="space-y-8">
                
                {/* Win Probability Widget */}
                <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="material-symbols-outlined text-primary/20 text-6xl">monitoring</span>
                  </div>
                  <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Win Probability</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-[64px] font-black leading-none text-primary">
                      {liveMetrics.winProbabilityBatting}
                    </span>
                    <span className="text-headline-md text-primary-fixed-dim">%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500 shadow-[0_0_10px_#4cd6ff]" 
                      style={{ width: `${liveMetrics.winProbabilityBatting}%` }}
                    ></div>
                  </div>
                  <p className="mt-4 text-label-sm text-secondary flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-sm">trending_up</span> 
                    CRR: {liveMetrics.currentRunRate} | RRR: {liveMetrics.requiredRunRate}
                  </p>
                </div>

                {/* Toolbox Status */}
                <div className="glass-panel rounded-xl p-6">
                  <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6 border-b border-outline-variant/30 pb-4">
                    Toolbox Status
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">database</span>
                        <span className="text-body-md font-semibold">Stadium Telemetry</span>
                      </div>
                      <span className="text-label-sm text-secondary px-2 py-0.5 bg-secondary/10 rounded font-bold">SUCCESS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">cloud</span>
                        <span className="text-body-md font-semibold">Dew Prediction</span>
                      </div>
                      <span className="text-label-sm text-primary px-2 py-0.5 bg-primary/10 rounded font-bold">CLEAR</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">biotech</span>
                        <span className="text-body-md font-semibold">Swarm Consensus</span>
                      </div>
                      <span className="text-label-sm text-secondary px-2 py-0.5 bg-secondary/10 rounded font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Pitch Heat Map Visual Data Feed */}
                <div className="rounded-xl overflow-hidden glass-panel border border-outline-variant/20">
                  <div className="p-4 bg-surface-container-highest/50 border-b border-outline-variant/30">
                    <h4 className="text-label-sm font-bold uppercase tracking-widest">Pitch Heat Map</h4>
                  </div>
                  <div className="aspect-square bg-surface-container flex items-center justify-center relative">
                    <img 
                      alt="Cricket Pitch Heatmap" 
                      className="w-full h-full object-cover opacity-60" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzS8h330iZCWkkX9jvkDupNJaoWr8zi-SN0HiIsln1vnBjRL9HNWhVGFypyXtJONcGhdobF2a_hRmsZG5GEIpqCD9azVAQLYvKk6rOw8SiSPuGe9iZN9lA3Nmk81yBGksNSC6M7j4e75mPv-xxbHQTvOnxijpHOOUrnDESOlpAuGnmKQRYqUMOGUVdB1TVEvXpxb6_J8ke6e7C128SK9ZOdiLNuuMFe4PnE4r4cU_SknLww9iAH_D1CeaI5K9kp5MfzMwma89ERuB1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="text-label-sm text-on-surface bg-surface/80 px-2 py-1 rounded font-bold">
                        Target Area: Good Length
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AGENTIC SWARM DEBATE TIMELINE */}
          {activeTab === "debate" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-headline-md font-bold text-primary mb-2">Swarm Consensus Timeline</h3>
                <p className="text-on-surface-variant opacity-75">
                  Witness the sequential thinking flow as environmental inputs transform into a validated tactical decision.
                </p>
              </div>

              {results ? (
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* Step 1 */}
                  <div className="glass-panel rounded-xl p-6 border-l-4 border-primary">
                    <h4 className="text-headline-md text-primary font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">stadium</span>
                      Phase 1: Environment Intelligence (Pitch Analyst)
                    </h4>
                    <pre className="text-body-md font-sans text-white white-space-pre-wrap">{results.pitch_report}</pre>
                  </div>

                  {/* Step 2 */}
                  <div className="glass-panel rounded-xl p-6 border-l-4 border-secondary">
                    <h4 className="text-headline-md text-secondary font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">query_stats</span>
                      Phase 2: Numerical Synthesis (Data Scout)
                    </h4>
                    <pre className="text-body-md font-sans text-white white-space-pre-wrap">{results.scout_report}</pre>
                  </div>

                  {/* Step 3 */}
                  <div className="glass-panel rounded-xl p-6 border-l-4 border-tertiary">
                    <h4 className="text-headline-md text-tertiary font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">bolt</span>
                      Phase 3: Plan A Proposal (Strategist)
                    </h4>
                    <pre className="text-body-md font-sans text-white white-space-pre-wrap">{results.plan_a}</pre>
                  </div>

                  {/* Step 4 */}
                  <div className="glass-panel rounded-xl p-6 border-l-4 border-error">
                    <h4 className="text-headline-md text-error font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">warning</span>
                      Phase 4: Stress-Testing Critique (Devil's Advocate)
                    </h4>
                    <pre className="text-body-md font-sans text-white white-space-pre-wrap">{results.critique}</pre>
                  </div>

                  {/* Step 5 */}
                  <div className="glass-panel rounded-xl p-6 border-l-4 border-success bg-surface-container-high">
                    <h4 className="text-headline-md text-green-400 font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">psychology</span>
                      Phase 5: The Captain's Call (Reconciliation)
                    </h4>
                    <pre className="text-body-md font-sans text-white white-space-pre-wrap">{results.final_call}</pre>
                  </div>

                </div>
              ) : (
                <div className="glass-panel rounded-xl p-12 text-center">
                  <span className="material-symbols-outlined text-primary text-5xl mb-4 animate-bounce">forum</span>
                  <h4 className="text-xl font-bold">No active debate trace found</h4>
                  <p className="text-on-surface-variant opacity-75 mt-2">
                    Initiate a strategic simulation in the sidebar to populate the swarm consensus logs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE PRESSURE & RUN RATE MATRIX */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Dynamic Matrix Controls */}
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-headline-md font-bold text-primary border-b border-outline-variant/30 pb-4">
                  Parameter Tuning (Win Matrix)
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-label-sm font-bold text-white flex justify-between">
                      <span>🏏 Target Score</span>
                      <span className="text-[#f72585]">{target} runs</span>
                    </label>
                    <input 
                      type="range" 
                      min="100" 
                      max="250"
                      className="w-full accent-[#f72585] bg-surface-container-highest rounded-lg h-2"
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-sm font-bold text-white flex justify-between">
                      <span>📊 Score Scored</span>
                      <span className="text-[#f72585]">{score} runs</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max={target}
                      className="w-full accent-[#f72585] bg-surface-container-highest rounded-lg h-2"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-sm font-bold text-white flex justify-between">
                      <span>❌ Wickets Fallen</span>
                      <span className="text-[#f72585]">{wickets} wickets</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="9"
                      className="w-full accent-[#f72585] bg-surface-container-highest rounded-lg h-2"
                      value={wickets}
                      onChange={(e) => setWickets(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-sm font-bold text-white flex justify-between">
                      <span>⏱️ Active Over</span>
                      <span className="text-[#f72585]">{over} overs</span>
                    </label>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="20" 
                      step="0.1"
                      className="w-full accent-[#f72585] bg-surface-container-highest rounded-lg h-2"
                      value={over}
                      onChange={(e) => setOver(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Matrix Telemetry Outputs */}
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-headline-md font-bold text-secondary border-b border-outline-variant/30 pb-4">
                  Calculated Matrix Output
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container/50 border border-outline-variant/30 p-4 rounded-lg text-center">
                    <h5 className="text-3xl font-black text-primary">{liveMetrics.currentRunRate}</h5>
                    <p className="text-label-sm text-on-surface-variant font-bold mt-1">Current Run Rate</p>
                  </div>
                  <div className="bg-surface-container/50 border border-outline-variant/30 p-4 rounded-lg text-center">
                    <h5 className="text-3xl font-black text-[#f72585]">{liveMetrics.requiredRunRate}</h5>
                    <p className="text-label-sm text-on-surface-variant font-bold mt-1">Required Run Rate</p>
                  </div>
                  <div className="bg-surface-container/50 border border-outline-variant/30 p-4 rounded-lg text-center">
                    <h5 className="text-3xl font-black text-[#79ff5b]">{liveMetrics.winProbabilityBatting}%</h5>
                    <p className="text-label-sm text-on-surface-variant font-bold mt-1">Win Prob (Bat)</p>
                  </div>
                  <div className="bg-surface-container/50 border border-outline-variant/30 p-4 rounded-lg text-center">
                    <h5 className="text-3xl font-black text-yellow-400">{liveMetrics.pressureIndex}%</h5>
                    <p className="text-label-sm text-on-surface-variant font-bold mt-1">Pressure Index</p>
                  </div>
                </div>

                <div className="bg-surface-container-highest/30 p-4 rounded-lg border border-outline-variant/20">
                  <strong className="text-secondary block mb-1">📢 Simulation Verdict:</strong>
                  <p className="text-body-md italic">"{liveMetrics.verdict}"</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: TOOLBOX INTEL (Stadium Boundary Dimensions) */}
          {activeTab === "toolbox" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(IPL_VENUES).map(([key, value]) => (
                <div key={key} className="glass-panel rounded-xl p-6 border-l-4 border-[#79ff5b]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-headline-md font-bold text-white">{value.name}</h3>
                    <span className="text-label-sm px-2 py-1 bg-surface-container rounded-full border border-outline-variant/30 font-bold">
                      {value.city}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-surface-container-low p-3 rounded text-center border border-outline-variant/20">
                      <div className="text-2xl font-black text-white">{value.straightBoundary}m</div>
                      <div className="text-label-sm text-on-surface-variant font-bold">Straight</div>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded text-center border border-outline-variant/20">
                      <div className="text-2xl font-black text-white">{value.squareBoundary}m</div>
                      <div className="text-label-sm text-on-surface-variant font-bold">Square</div>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded text-center border border-outline-variant/20">
                      <div className="text-2xl font-black text-yellow-400">{value.avgFirstInnings}</div>
                      <div className="text-label-sm text-on-surface-variant font-bold">Avg 1st Inn</div>
                    </div>
                  </div>

                  <div className="text-body-md text-on-surface-variant leading-relaxed space-y-2">
                    <p><strong>📐 Turf Dimensions:</strong> {value.boundaryDimensionDetails}</p>
                    <p><strong>💡 Stadium Record:</strong> {value.historicalInsights}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: CONFIG CONFIGURATION SETUP */}
          {activeTab === "settings" && (
            <div className="glass-panel rounded-xl p-8 max-w-4xl mx-auto space-y-8">
              
              {/* Top Heading with Captain Profile DNA */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant/30 pb-6 gap-4">
                <div>
                  <h3 className="text-headline-md font-bold text-primary">
                    ⚙️ Platform Configuration Room
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">Tweak the live parameters feeding the multi-agent AI swarm.</p>
                </div>
                <div className="bg-[#f72585]/10 border border-[#f72585]/30 rounded-lg p-3 max-w-sm">
                  <strong className="text-[#f72585] text-sm block">DNA Profile: {activeCaptainProfile.emoji} {captainMode}</strong>
                  <p className="text-xs text-on-surface mt-1">{activeCaptainProfile.profile}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gemini API Key */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">🔑 Google Gemini API Key</label>
                  <input 
                    type="password"
                    placeholder="API Key (Persistent local Session)"
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-[11px] text-on-surface-variant">Key is saved securely inside your local browser storage.</p>
                </div>

                {/* Captain DNA Choice */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">🧠 Captain DNA Persona</label>
                  <select 
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary"
                    value={captainMode}
                    onChange={(e) => setCaptainMode(e.target.value)}
                  >
                    <option value="Dhoni">MS Dhoni (Ice-Cold Defend)</option>
                    <option value="Rohit">Rohit Sharma (Matchups Analytical)</option>
                    <option value="Gambhir">Gautam Gambhir (Attacking Spin Choke)</option>
                  </select>
                </div>

                {/* Stadium Venue */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">🏟️ Stadium Venue</label>
                  <select 
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  >
                    <option value="Wankhede Stadium">Wankhede Stadium (Mumbai)</option>
                    <option value="M. Chinnaswamy Stadium">M. Chinnaswamy Stadium (Bengaluru)</option>
                    <option value="MA Chidambaram Stadium">MA Chidambaram Stadium (Chennai)</option>
                    <option value="Eden Gardens">Eden Gardens (Kolkata)</option>
                    <option value="Arun Jaitley Stadium">Arun Jaitley Stadium (Delhi)</option>
                    <option value="Narendra Modi Stadium">Narendra Modi Stadium (Ahmedabad)</option>
                  </select>
                </div>

                {/* Pitch turf condition soil */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">⚡ Soil Condition Turf</label>
                  <select 
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                    value={pitchCondition}
                    onChange={(e) => setPitchCondition(e.target.value)}
                  >
                    <option value="Turning">Turning (Spin Heaven)</option>
                    <option value="Flat">Flat (Batting Paradise)</option>
                    <option value="Two-Paced">Two-Paced (Variable Bounce)</option>
                    <option value="Seaming">Seaming (Green Grassy Fast)</option>
                  </select>
                </div>

                {/* Score and Wickets */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">📊 Match Scoreboard</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block mb-1">Score</span>
                      <input 
                        type="number" 
                        className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-2 text-white w-full"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block mb-1">Wickets</span>
                      <input 
                        type="number" 
                        className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-2 text-white w-full"
                        value={wickets}
                        onChange={(e) => setWickets(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block mb-1">Overs</span>
                      <input 
                        type="number" 
                        step="0.1"
                        className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-2 text-white w-full"
                        value={over}
                        onChange={(e) => setOver(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Innings and Target */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">🏏 Innings & Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block mb-1">Innings</span>
                      <select 
                        className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-2 text-white w-full"
                        value={innings}
                        onChange={(e) => setInnings(Number(e.target.value))}
                      >
                        <option value={1}>1st Innings</option>
                        <option value={2}>2nd Innings</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block mb-1">Target</span>
                      <input 
                        type="number" 
                        disabled={innings === 1}
                        className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-2 text-white w-full disabled:opacity-40"
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Match Striker & Non-Striker */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">🏏 Active Batsmen</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Striker"
                      className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                      value={striker}
                      onChange={(e) => setStriker(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Non-Striker"
                      className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                      value={nonStriker}
                      onChange={(e) => setNonStriker(e.target.value)}
                    />
                  </div>
                </div>

                {/* Match Bowler */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">🏃 Current Bowler</label>
                  <input 
                    type="text"
                    placeholder="Bowler"
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                    value={bowler}
                    onChange={(e) => setBowler(e.target.value)}
                  />
                </div>

                {/* Teams config */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">⚔️ Teams Config</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Batting Team"
                      className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                      value={battingTeam}
                      onChange={(e) => setBattingTeam(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Bowling Team"
                      className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                      value={bowlingTeam}
                      onChange={(e) => setBowlingTeam(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dew Factor Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm font-bold text-white">💧 Dew Factor</label>
                  <select 
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                    value={dew}
                    onChange={(e) => setDew(e.target.value)}
                  >
                    <option value="None">None</option>
                    <option value="Light">Light Dew</option>
                    <option value="Heavy">Heavy Dew Factor</option>
                  </select>
                </div>

                {/* Bowler Overs Used */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-label-sm font-bold text-white">🏃 Bowlers Completed Overs</label>
                  <textarea
                    rows={2}
                    className="bg-surface-container-low border-2 border-outline-variant/50 rounded-lg p-3 text-white"
                    value={bowlersUsed}
                    onChange={(e) => setBowlersUsed(e.target.value)}
                  />
                </div>

              </div>

              {/* Decision History log inside settings for maximum trace visibility */}
              {history.length > 0 && (
                <div className="border-t border-outline-variant/30 pt-6 mt-6">
                  <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">history</span>
                    Decision History Log
                  </h4>
                  <div className="space-y-4">
                    {history.map((h, idx) => (
                      <div key={idx} className="bg-surface-container/40 p-4 rounded-lg border border-outline-variant/20">
                        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-2">
                          <span>Over {h.over} | Score: {h.score}</span>
                          <span className="text-[#f72585]">Captain Mode: {h.captain}</span>
                        </div>
                        <p className="text-sm italic">"{h.call}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ════════════════════════════════════════════════════════
         BOTTOM MOBILE NAVIGATION BAR (REACTION STYLES)
         ════════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-container-highest/95 backdrop-blur-lg border-t border-primary/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] rounded-t-xl">
        <button 
          onClick={() => setActiveTab("command")}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${activeTab === 'command' ? 'bg-primary text-on-primary animate-pulse' : 'text-on-surface-variant opacity-70'}`}
        >
          <span className="material-symbols-outlined">sports_cricket</span>
          <span className="text-label-sm">Command</span>
        </button>
        
        <button 
          onClick={() => setActiveTab("debate")}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${activeTab === 'debate' ? 'bg-primary text-on-primary animate-pulse' : 'text-on-surface-variant opacity-70'}`}
        >
          <span className="material-symbols-outlined">diversity_3</span>
          <span className="text-label-sm">Debate</span>
        </button>

        <button 
          onClick={() => setActiveTab("analytics")}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary text-on-primary animate-pulse' : 'text-on-surface-variant opacity-70'}`}
        >
          <span className="material-symbols-outlined">bolt</span>
          <span className="text-label-sm">Analytics</span>
        </button>

        <button 
          onClick={() => setActiveTab("toolbox")}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${activeTab === 'toolbox' ? 'bg-primary text-on-primary animate-pulse' : 'text-on-surface-variant opacity-70'}`}
        >
          <span className="material-symbols-outlined">biotech</span>
          <span className="text-label-sm">Intel</span>
        </button>
      </nav>

    </div>
  );
}

export default App;
