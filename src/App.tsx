import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Employee, Match, GameState } from './types/game';
import {
  ROUND_QUESTIONS,
  DEFAULT_EMPLOYEES,
  DEFAULT_PRIZES,
} from './data/questions';
import { soundEffects } from './utils/sound';
import { SpinningWheel } from './components/SpinningWheel';
import { MatchArena } from './components/MatchArena';
import { TournamentBracket } from './components/TournamentBracket';
import { RosterManagerModal } from './components/RosterManagerModal';
import { HostGuideModal } from './components/HostGuideModal';
import {
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  LayoutGrid,
  Sparkles,
  Users,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY = 'OFFICE_TRIVIA_SHOWDOWN_V1';

// Initial matches generator
function createInitialMatches(employees: Employee[] = DEFAULT_EMPLOYEES): Record<number, Match[]> {
  const matchesByRound: Record<number, Match[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  // Round 1 (8 matches)
  for (let i = 0; i < 8; i++) {
    const q = ROUND_QUESTIONS[1][i];
    matchesByRound[1].push({
      id: `r1-m${i + 1}`,
      round: 1,
      matchNumber: i + 1,
      contender1: null,
      contender2: null,
      winner: null,
      question: q,
      status: 'pending',
    });
  }

  // Round 2 (4 matches)
  for (let i = 0; i < 4; i++) {
    const q = ROUND_QUESTIONS[2][i];
    matchesByRound[2].push({
      id: `r2-m${i + 1}`,
      round: 2,
      matchNumber: i + 1,
      contender1: null,
      contender2: null,
      winner: null,
      question: q,
      status: 'pending',
    });
  }

  // Round 3 (2 matches)
  for (let i = 0; i < 2; i++) {
    const q = ROUND_QUESTIONS[3][i];
    matchesByRound[3].push({
      id: `r3-m${i + 1}`,
      round: 3,
      matchNumber: i + 1,
      contender1: null,
      contender2: null,
      winner: null,
      question: q,
      status: 'pending',
    });
  }

  // Round 4 (1 match)
  const finalQ = ROUND_QUESTIONS[4][0];
  matchesByRound[4].push({
    id: `r4-m1`,
    round: 4,
    matchNumber: 1,
    contender1: null,
    contender2: null,
    winner: null,
    question: finalQ,
    status: 'pending',
  });

  return matchesByRound;
}

// Default initial state
function getInitialGameState(): GameState {
  return {
    currentRound: 1,
    currentMatchIndex: 0,
    employees: DEFAULT_EMPLOYEES,
    roundPools: {
      1: [...DEFAULT_EMPLOYEES],
      2: [],
      3: [],
      4: [],
    },
    matchesByRound: createInitialMatches(DEFAULT_EMPLOYEES),
    prizes: DEFAULT_PRIZES,
    soundEnabled: true,
    gameStatus: 'playing',
    champion: null,
  };
}

export default function App() {
  // Load state from localStorage or default
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window === 'undefined') return getInitialGameState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure structure validity
        if (parsed.currentRound && parsed.matchesByRound) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return getInitialGameState();
  });

  // UI Modals & Views
  const [viewMode, setViewMode] = useState<'arena' | 'bracket'>('arena');
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [roundTransitionModal, setRoundTransitionModal] = useState<{
    show: boolean;
    completedRound: number;
    advancingEmployees: Employee[];
  }>({
    show: false,
    completedRound: 0,
    advancingEmployees: [],
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // storage quota or private mode catch
    }
  }, [gameState]);

  // Current active match
  const currentRoundMatches = gameState.matchesByRound[gameState.currentRound] || [];
  const currentMatch: Match | undefined = currentRoundMatches[gameState.currentMatchIndex];
  const roundPool = gameState.roundPools[gameState.currentRound] || [];

  // Determine which contender the wheel is currently picking
  const targetSlot: 'contender1' | 'contender2' =
    currentMatch && currentMatch.contender1 === null ? 'contender1' : 'contender2';

  // Toggle sound
  const toggleSound = () => {
    setGameState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // Handle employee selected from the spinning wheel
  // Prompt requirement: "and randomly selecting once it was selected, it was deleted from the wheel."
  const handleSelectEmployeeFromWheel = useCallback((selectedEmployee: Employee) => {
    setGameState((prev) => {
      const round = prev.currentRound;
      const matchIdx = prev.currentMatchIndex;
      const currentRoundMatches = [...prev.matchesByRound[round]];
      const targetMatch = { ...currentRoundMatches[matchIdx] };

      // Assign to either contender 1 or contender 2
      if (targetMatch.contender1 === null) {
        targetMatch.contender1 = selectedEmployee;
      } else if (targetMatch.contender2 === null) {
        targetMatch.contender2 = selectedEmployee;
        targetMatch.status = 'ready';
      }

      currentRoundMatches[matchIdx] = targetMatch;

      // Delete selected employee from the current round's wheel pool
      const updatedPool = prev.roundPools[round].filter(
        (emp) => emp.id !== selectedEmployee.id
      );

      return {
        ...prev,
        roundPools: {
          ...prev.roundPools,
          [round]: updatedPool,
        },
        matchesByRound: {
          ...prev.matchesByRound,
          [round]: currentRoundMatches,
        },
      };
    });
  }, []);

  // Handle match completion (winner selected!)
  const handleMatchComplete = useCallback((winner: Employee) => {
    setGameState((prev) => {
      const round = prev.currentRound;
      const matchIdx = prev.currentMatchIndex;
      const currentRoundMatches = [...prev.matchesByRound[round]];
      const targetMatch = { ...currentRoundMatches[matchIdx] };

      targetMatch.winner = winner;
      targetMatch.status = 'completed';
      currentRoundMatches[matchIdx] = targetMatch;

      const nextMatchesByRound = {
        ...prev.matchesByRound,
        [round]: currentRoundMatches,
      };

      // Check if all matches in current round are complete
      const allMatchesInRoundComplete = currentRoundMatches.every(
        (m) => m.winner !== null
      );

      if (allMatchesInRoundComplete) {
        // Collect all winners of this round
        const roundWinners = currentRoundMatches
          .map((m) => m.winner)
          .filter((w): w is Employee => w !== null);

        if (round === 4) {
          // CHAMPION CROWNED!
          if (prev.soundEnabled) soundEffects.playGrandFanfare();
          try {
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.5 },
              colors: ['#FEAEC9', '#9AD9EA', '#C7BFE8', '#FFD700', '#FFF'],
            });
          } catch {
            // ignore
          }
          return {
            ...prev,
            matchesByRound: nextMatchesByRound,
            champion: winner,
            gameStatus: 'champion',
          };
        } else {
          // Advance to next round!
          const nextRound = round + 1;
          // Set the pool for the next round to the winners of this round!
          // Round 1 (16) -> 8 winners for Round 2
          // Round 2 (8) -> 4 winners for Round 3
          // Round 3 (4) -> 2 winners for Round 4
          if (prev.soundEnabled) soundEffects.playGrandFanfare();

          // Trigger round transition celebration modal
          setRoundTransitionModal({
            show: true,
            completedRound: round,
            advancingEmployees: roundWinners,
          });

          return {
            ...prev,
            currentRound: nextRound,
            currentMatchIndex: 0,
            roundPools: {
              ...prev.roundPools,
              [nextRound]: [...roundWinners],
            },
            matchesByRound: nextMatchesByRound,
          };
        }
      } else {
        // Advance to next match in the same round
        return {
          ...prev,
          currentMatchIndex: matchIdx + 1,
          matchesByRound: nextMatchesByRound,
        };
      }
    });
  }, []);

  // Reset / Restart Entire Tournament
  const handleResetGame = () => {
    const fresh = getInitialGameState();
    setGameState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  };

  // Save modified roster or prizes
  const handleSaveSettings = (
    updatedEmployees: Employee[],
    updatedPrizes: { round1: string; round2: string; round3: string; round4: string }
  ) => {
    setGameState((prev) => {
      // If still in Round 1 before spinning, update round 1 pool as well
      const isStart =
        prev.currentRound === 1 &&
        prev.currentMatchIndex === 0 &&
        (!currentMatch || (currentMatch.contender1 === null && currentMatch.contender2 === null));

      return {
        ...prev,
        employees: updatedEmployees,
        prizes: updatedPrizes,
        roundPools: isStart
          ? {
              ...prev.roundPools,
              1: [...updatedEmployees],
            }
          : prev.roundPools,
      };
    });
  };

  // Check if both contenders have been spun for the current match
  const bothContendersReady = Boolean(
    currentMatch && currentMatch.contender1 && currentMatch.contender2
  );

  return (
    <div className="min-h-screen bg-[#E8E0EE] text-[#2d2440] flex flex-col font-sans selection:bg-[#FEAEC9]">
      {/* Top Header / Office Game Show Marquee */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b-2 border-[#C7BFE8]/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Bubbly Typography */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#FEAEC9] via-[#C7BFE8] to-[#9AD9EA] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-xl sm:text-2xl animate-bounce-slow">🎯</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-game text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#FEAEC9] drop-shadow-[0_2px_0_#9AD9EA]">
                  OFFICE TRIVIA
                </h1>
                <span className="hidden sm:inline-block font-game text-[11px] font-bold uppercase tracking-wider text-[#735b91] bg-[#FAF5FF] px-2 py-0.5 rounded-full border border-[#C7BFE8]">
                  SHOWDOWN
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#6a5482]">
                <span className="uppercase tracking-widest text-[#9AD9EA] font-extrabold">PLAY</span>
                <span>•</span>
                <span className="uppercase tracking-widest text-[#FEAEC9] font-extrabold">THINK</span>
                <span>•</span>
                <span className="uppercase tracking-widest text-[#C7BFE8] font-extrabold">HAVE FUN</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {/* View Switcher: Arena vs Bracket */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl bg-[#E8E0EE]/70 border border-[#C7BFE8]">
              <button
                onClick={() => setViewMode('arena')}
                className={`py-1.5 px-3 rounded-xl font-game font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'arena'
                    ? 'bg-white text-[#2e1d38] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Arena & Wheel</span>
              </button>
              <button
                onClick={() => setViewMode('bracket')}
                className={`py-1.5 px-3 rounded-xl font-game font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'bracket'
                    ? 'bg-white text-[#2e1d38] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Bracket</span>
              </button>
            </div>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              aria-label={gameState.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-slate-50 border border-[#C7BFE8] flex items-center justify-center text-[#55426e] shadow-xs cursor-pointer transition-all"
              title={gameState.soundEnabled ? 'Sound is ON' : 'Sound is MUTED'}
            >
              {gameState.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#863e60]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Host Tutorial / Guide */}
            <button
              onClick={() => setShowGuide(true)}
              aria-label="Host Instructions and Tutorial"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-slate-50 border border-[#C7BFE8] flex items-center justify-center text-[#55426e] shadow-xs cursor-pointer transition-all"
              title="Host Instructions & VS Code Guide"
            >
              <HelpCircle className="w-4 h-4 text-[#205e6f]" />
            </button>

            {/* Settings & Roster */}
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Contenders and Prize Settings"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-slate-50 border border-[#C7BFE8] flex items-center justify-center text-[#55426e] shadow-xs cursor-pointer transition-all"
              title="Manage 16 Players & Prizes"
            >
              <Settings className="w-4 h-4 text-[#5e4b78]" />
            </button>
          </div>
        </div>

        {/* Mobile Subnav View Switcher */}
        <div className="sm:hidden flex border-t border-[#E8E0EE] px-4 py-1.5 gap-2 bg-white/50">
          <button
            onClick={() => setViewMode('arena')}
            className={`flex-1 py-1.5 rounded-xl font-game font-bold text-xs text-center ${
              viewMode === 'arena' ? 'bg-[#FEAEC9] text-[#2c1723]' : 'text-slate-600'
            }`}
          >
            Game Arena
          </button>
          <button
            onClick={() => setViewMode('bracket')}
            className={`flex-1 py-1.5 rounded-xl font-game font-bold text-xs text-center ${
              viewMode === 'bracket' ? 'bg-[#9AD9EA] text-[#1a3840]' : 'text-slate-600'
            }`}
          >
            Tournament Bracket
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Tournament Round Ribbon */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-white/80 border-2 border-white shadow-sm">
          {/* Round Indicator Steps */}
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto py-1">
            {[1, 2, 3, 4].map((r) => {
              const isCurrent = gameState.currentRound === r;
              const isPast = gameState.currentRound > r;

              return (
                <div
                  key={r}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-game font-bold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-[#FEAEC9] text-[#341624] shadow-xs ring-2 ring-[#FEAEC9]/50'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-[#E8E0EE] text-slate-500'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/70 text-[10px] flex items-center justify-center">
                      {r}
                    </span>
                  )}
                  <span>
                    {r === 1 && 'Round 1 (16)'}
                    {r === 2 && 'Round 2 (8)'}
                    {r === 3 && 'Round 3 (4)'}
                    {r === 4 && 'Championship (2)'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Round Prize Info */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5a4872]">
            <Trophy className="w-4 h-4 text-[#863e60]" />
            <span className="hidden md:inline">Current Round Prize:</span>
            <span className="font-bold text-[#863e60] bg-[#FFF0F5] px-2 py-0.5 rounded-lg border border-[#FEAEC9]/50 truncate max-w-xs">
              {gameState.currentRound === 1 && gameState.prizes.round1}
              {gameState.currentRound === 2 && gameState.prizes.round2}
              {gameState.currentRound === 3 && gameState.prizes.round3}
              {gameState.currentRound === 4 && gameState.prizes.round4}
            </span>
          </div>
        </div>

        {/* BRACKET VIEW */}
        {viewMode === 'bracket' && (
          <div className="w-full flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-game text-xl sm:text-2xl font-black text-[#2e2640]">
                Tournament Ladder & Qualified Winners
              </h2>
              <button
                onClick={() => setViewMode('arena')}
                className="game-btn-pink font-game font-bold text-xs text-[#2c1723] py-2 px-4 rounded-xl cursor-pointer"
              >
                Back to Live Match Arena →
              </button>
            </div>

            <TournamentBracket
              matchesByRound={gameState.matchesByRound}
              currentRound={gameState.currentRound}
              currentMatchIndex={gameState.currentMatchIndex}
              champion={gameState.champion}
              prizes={gameState.prizes}
            />
          </div>
        )}

        {/* ARENA VIEW */}
        {viewMode === 'arena' && (
          <div className="w-full flex flex-col gap-6">
            {/* If Grand Champion is Crowned */}
            {gameState.champion ? (
              <div className="game-card rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-r from-[#FEAEC9]/40 via-white to-[#9AD9EA]/40 border-4 border-[#FEAEC9] shadow-2xl animate-bell-pop max-w-3xl mx-auto w-full">
                <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#FEAEC9] via-[#C7BFE8] to-[#9AD9EA] flex items-center justify-center shadow-xl border-4 border-white animate-bounce-slow">
                  <Trophy className="w-14 h-14 text-[#4a2461]" />
                </div>
                <span className="font-game text-sm font-extrabold uppercase tracking-widest text-[#863e60]">
                  🎉 WE HAVE A WINNER! 🎉
                </span>
                <h2 className="font-game text-4xl sm:text-5xl font-black text-[#2e1c3b] mt-2 mb-2">
                  {gameState.champion.name}
                </h2>
                {gameState.champion.department && (
                  <p className="text-base font-bold text-[#614e7a] mb-4">
                    {gameState.champion.department}
                  </p>
                )}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/80 border-2 border-[#FEAEC9] shadow-sm mb-6 text-sm text-[#3b172a] font-bold">
                  🏆 Grand Championship Prize: {gameState.prizes.round4}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setViewMode('bracket')}
                    className="game-btn-blue font-game font-bold text-sm text-[#1b363f] py-3 px-6 rounded-2xl cursor-pointer"
                  >
                    View Final Tournament Bracket
                  </button>
                  <button
                    onClick={handleResetGame}
                    className="game-btn-pink font-game font-bold text-sm text-[#2d1825] py-3 px-6 rounded-2xl flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Start New Tournament
                  </button>
                </div>
              </div>
            ) : bothContendersReady && currentMatch ? (
              /* MATCH ARENA (Both contenders stand in front, question & clap signal ready) */
              <div className="w-full flex flex-col gap-4 animate-fade-in">
                {/* Notice banner */}
                <div className="p-3 rounded-2xl bg-[#FFF9FB] border border-[#FEAEC9] flex items-center justify-between text-xs text-[#523d61]">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📢</span>
                    <span>
                      <strong>Contenders Selected:</strong> Both contenders stand in front! All other coworkers sit down, watch, and refrain from coaching!
                    </span>
                  </div>
                  <button
                    onClick={() => setViewMode('bracket')}
                    className="text-xs font-bold text-[#863e60] underline cursor-pointer shrink-0 ml-2"
                  >
                    View Bracket
                  </button>
                </div>

                <MatchArena
                  match={currentMatch}
                  roundNumber={gameState.currentRound}
                  soundEnabled={gameState.soundEnabled}
                  onMatchComplete={handleMatchComplete}
                />
              </div>
            ) : (
              /* SPINNING WHEEL ARENA (Selecting contenders for the current match) */
              <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                {/* Match Preview Card */}
                {currentMatch && (
                  <div className="game-card max-w-2xl w-full rounded-3xl p-5 border-2 border-white shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E8E0EE]">
                      <div className="flex items-center gap-2">
                        <span className="font-game text-xs font-bold uppercase tracking-wider text-[#796396]">
                          Round {gameState.currentRound} • Match #{currentMatch.matchNumber} of {currentRoundMatches.length}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#6c5980]">
                        Contenders in Wheel:{' '}
                        <span className="font-bold text-[#863e60]">{roundPool.length}</span>
                      </div>
                    </div>

                    {/* Both Contender Podiums */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Contender 1 Slot */}
                      <div
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          currentMatch.contender1
                            ? 'bg-[#FEAEC9]/30 border-[#FEAEC9] shadow-sm'
                            : targetSlot === 'contender1'
                            ? 'bg-white border-[#FEAEC9] ring-2 ring-[#FEAEC9]/40'
                            : 'bg-white/60 border-[#E8E0EE]'
                        }`}
                      >
                        <span className="font-game text-[11px] font-extrabold uppercase tracking-wider text-[#863e60] block mb-1">
                          Contender 1
                        </span>
                        {currentMatch.contender1 ? (
                          <>
                            <div className="font-game text-lg font-black text-[#2e2640] truncate">
                              {currentMatch.contender1.name}
                            </div>
                            <span className="text-[11px] text-[#6e5d85] font-medium block truncate">
                              {currentMatch.contender1.department || 'Ready!'}
                            </span>
                            <span className="mt-2 inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              ✓ Standing in Front
                            </span>
                          </>
                        ) : (
                          <div className="py-2 text-xs font-bold text-slate-400 italic">
                            Spinning Wheel to Select...
                          </div>
                        )}
                      </div>

                      {/* Contender 2 Slot */}
                      <div
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          currentMatch.contender2
                            ? 'bg-[#9AD9EA]/30 border-[#9AD9EA] shadow-sm'
                            : targetSlot === 'contender2'
                            ? 'bg-white border-[#9AD9EA] ring-2 ring-[#9AD9EA]/40'
                            : 'bg-white/60 border-[#E8E0EE]'
                        }`}
                      >
                        <span className="font-game text-[11px] font-extrabold uppercase tracking-wider text-[#215664] block mb-1">
                          Contender 2
                        </span>
                        {currentMatch.contender2 ? (
                          <>
                            <div className="font-game text-lg font-black text-[#2e2640] truncate">
                              {currentMatch.contender2.name}
                            </div>
                            <span className="text-[11px] text-[#6e5d85] font-medium block truncate">
                              {currentMatch.contender2.department || 'Ready!'}
                            </span>
                            <span className="mt-2 inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              ✓ Standing in Front
                            </span>
                          </>
                        ) : (
                          <div className="py-2 text-xs font-bold text-slate-400 italic">
                            {currentMatch.contender1
                              ? 'Spinning Wheel to Select...'
                              : 'Waiting for Contender 1'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Canvas Spinning Wheel */}
                {currentMatch && (
                  <SpinningWheel
                    employees={roundPool}
                    targetSlot={targetSlot}
                    roundNumber={gameState.currentRound}
                    matchNumber={currentMatch.matchNumber}
                    onSelectEmployee={handleSelectEmployeeFromWheel}
                    soundEnabled={gameState.soundEnabled}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Round Complete Transition Celebration Modal */}
      {roundTransitionModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="game-card max-w-lg w-full rounded-3xl p-6 sm:p-8 text-center relative border-4 border-[#FEAEC9] animate-bell-pop">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#FEAEC9] to-[#9AD9EA] flex items-center justify-center shadow-lg border-4 border-white">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <span className="font-game text-xs uppercase tracking-widest text-[#863e60] font-bold">
              Round {roundTransitionModal.completedRound} Finished!
            </span>
            <h2 className="font-game text-3xl font-black text-[#2e2640] mt-1 mb-2">
              Congratulations Qualifiers!
            </h2>
            <p className="text-xs text-[#5e5170] mb-4">
              The following {roundTransitionModal.advancingEmployees.length} contenders have won their head-to-head matches and advance to{' '}
              <strong>Round {roundTransitionModal.completedRound + 1}</strong>!
            </p>

            {/* List of advancing contenders */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-6 p-2 bg-[#FAF5FF] rounded-2xl border border-[#C7BFE8]">
              {roundTransitionModal.advancingEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-2 rounded-xl bg-white border border-[#E8E0EE] text-xs font-game font-bold text-[#2d1b32] truncate text-center shadow-xs"
                >
                  🎉 {emp.name}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setRoundTransitionModal({ show: false, completedRound: 0, advancingEmployees: [] });
              }}
              className="w-full game-btn-pink font-game font-bold text-base text-[#2e1d32] py-3.5 px-6 rounded-2xl cursor-pointer"
            >
              Start Round {roundTransitionModal.completedRound + 1} Spinning Wheel →
            </button>
          </div>
        </div>
      )}

      {/* Settings / Roster Manager Modal */}
      {showSettings && (
        <RosterManagerModal
          employees={gameState.employees}
          prizes={gameState.prizes}
          onSave={handleSaveSettings}
          onResetGame={handleResetGame}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Host Guide & Tutorial Modal */}
      {showGuide && <HostGuideModal onClose={() => setShowGuide(false)} />}

      {/* Footer */}
      <footer className="mt-auto py-4 px-4 text-center text-xs text-[#715c87] border-t border-[#C7BFE8]/30 bg-white/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Office Trivia Showdown • 16 Players → 8 → 4 → 2 → Champion
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuide(true)}
              className="underline hover:text-slate-900 cursor-pointer"
            >
              How to Play & VS Code Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setShowSettings(true)}
              className="underline hover:text-slate-900 cursor-pointer"
            >
              Roster & Prizes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
