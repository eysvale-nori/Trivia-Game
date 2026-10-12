import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Employee, Match, QuestionItem } from '../types/game';
import { BONUS_QUESTIONS } from '../data/questions';
import { soundEffects } from '../utils/sound';
import { RPSModal } from './RPSModal';
import {
  Bell,
  Clock,
  Check,
  X,
  RefreshCw,
  Trophy,
  HelpCircle,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MatchArenaProps {
  match: Match;
  roundNumber: number;
  soundEnabled: boolean;
  onMatchComplete: (winner: Employee) => void;
  onBackToWheel?: () => void;
}

type TurnState =
  | 'reading' // Host is reading question (15-sec countdown or manual trigger)
  | 'signaled' // 🔔 Clap signal has triggered! Waiting for contender to clap
  | 'answering' // One contender clapped first, has 30-sec response timer
  | 'stealing' // First contender was wrong/timed out, opponent has 30-sec steal chance
  | 'both_wrong' // Both got it wrong, host offers bonus question
  | 'resolved'; // Answer revealed, winner crowned for this match

export const MatchArena: React.FC<MatchArenaProps> = ({
  match,
  roundNumber,
  soundEnabled,
  onMatchComplete,
}) => {
  const contender1 = match.contender1!;
  const contender2 = match.contender2!;

  // Current question (default round question, or switched to bonus question)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem>(match.question);
  const [bonusIndex, setBonusIndex] = useState(0);

  // Flow & Turn State
  const [turnState, setTurnState] = useState<TurnState>('reading');
  const [activeContender, setActiveContender] = useState<Employee | null>(null);
  const [firstAttemptFailed, setFirstAttemptFailed] = useState(false);

  // Timers
  const [readCountdown, setReadCountdown] = useState<number>(15);
  const [isReadTimerRunning, setIsReadTimerRunning] = useState<boolean>(true);

  const [answerCountdown, setAnswerCountdown] = useState<number>(30);
  const [isAnswerTimerRunning, setIsAnswerTimerRunning] = useState<boolean>(false);

  // Answer Visibility & Hint
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [revealedLettersCount, setRevealedLettersCount] = useState<number>(0);

  // Tie-breaker modal state
  const [showRPS, setShowRPS] = useState<boolean>(false);

  // Bell Signal Pop Animation
  const [bellJustRung, setBellJustRung] = useState<boolean>(false);

  // Winner of this match
  const [matchWinner, setMatchWinner] = useState<Employee | null>(null);

  // Timer interval references
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 15-second Question Reading Timer
  useEffect(() => {
    if (turnState === 'reading' && isReadTimerRunning) {
      timerRef.current = setInterval(() => {
        setReadCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            triggerClapSignal();
            return 0;
          }
          if (prev <= 4 && soundEnabled) {
            soundEffects.playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turnState, isReadTimerRunning, soundEnabled]);

  // 30-second Contender Response Timer
  useEffect(() => {
    if ((turnState === 'answering' || turnState === 'stealing') && isAnswerTimerRunning) {
      timerRef.current = setInterval(() => {
        setAnswerCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeOut();
            return 0;
          }
          if (prev <= 6 && soundEnabled) {
            soundEffects.playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turnState, isAnswerTimerRunning, soundEnabled]);

  // Trigger Clap Signal (Host can also press 🔔 manually at any time!)
  const triggerClapSignal = () => {
    if (turnState === 'signaled' || turnState === 'answering' || turnState === 'stealing' || turnState === 'resolved') {
      return;
    }
    setTurnState('signaled');
    setIsReadTimerRunning(false);
    setBellJustRung(true);
    setTimeout(() => setBellJustRung(false), 2000);

    if (soundEnabled) {
      soundEffects.playBell();
    }
  };

  // Contender clapped first!
  const handleContenderClapped = (contender: Employee) => {
    if (soundEnabled) {
      soundEffects.playClap();
    }
    setActiveContender(contender);
    setTurnState('answering');
    setAnswerCountdown(30);
    setIsAnswerTimerRunning(true);
  };

  // Answer is Correct!
  const handleCorrectAnswer = (winningContender: Employee) => {
    setIsAnswerTimerRunning(false);
    setIsAnswerRevealed(true);
    setMatchWinner(winningContender);
    setTurnState('resolved');

    if (soundEnabled) {
      soundEffects.playCorrect();
    }

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#FEAEC9', '#9AD9EA', '#C7BFE8', '#FFF'],
      });
    } catch {
      // ignore
    }
  };

  // Answer is Wrong or Time Out
  const handleWrongAnswerOrTimeout = () => {
    setIsAnswerTimerRunning(false);
    if (soundEnabled) {
      soundEffects.playBuzzer();
    }

    if (turnState === 'answering' && activeContender) {
      // First contender missed! Give opponent a chance to steal!
      const opponent = activeContender.id === contender1.id ? contender2 : contender1;
      setFirstAttemptFailed(true);
      setActiveContender(opponent);
      setTurnState('stealing');
      setAnswerCountdown(30);
      setIsAnswerTimerRunning(true);
    } else if (turnState === 'stealing') {
      // Both failed! Offer bonus question!
      setTurnState('both_wrong');
      setIsAnswerRevealed(true); // reveal the original question's answer
    }
  };

  const handleTimeOut = () => {
    handleWrongAnswerOrTimeout();
  };

  // Switch to a Bonus Question when both fail
  const handleNextBonusQuestion = () => {
    const nextBonus = BONUS_QUESTIONS[bonusIndex % BONUS_QUESTIONS.length];
    setBonusIndex((prev) => prev + 1);
    setCurrentQuestion(nextBonus);
    setTurnState('reading');
    setActiveContender(null);
    setFirstAttemptFailed(false);
    setIsAnswerRevealed(false);
    setRevealedLettersCount(0);
    setReadCountdown(15);
    setIsReadTimerRunning(true);
    setAnswerCountdown(30);
    setIsAnswerTimerRunning(false);
    setMatchWinner(null);
  };

  // Format Letter Hint (_ _ _ _ _)
  const formatLetterHint = (rawAnswer: string, revealedCount: number) => {
    const cleanAnswer = rawAnswer.toUpperCase();
    const characters = cleanAnswer.split('');

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-3">
        {characters.map((char, index) => {
          if (char === ' ') {
            return <span key={index} className="w-5 inline-block" />;
          }
          if (char === '-') {
            return (
              <span key={index} className="text-xl font-extrabold text-[#7b6b8e] px-1">
                -
              </span>
            );
          }

          const isRevealed = isAnswerRevealed || index < revealedCount;

          return (
            <div
              key={index}
              className={`w-7 h-9 sm:w-9 sm:h-11 rounded-lg border-2 flex items-center justify-center font-game font-bold text-lg sm:text-xl transition-all ${
                isRevealed
                  ? 'bg-white border-[#FEAEC9] text-[#2d1f3b] shadow-sm animate-bell-pop'
                  : 'bg-white/40 border-[#83709b] text-transparent border-b-4 border-b-[#4d3b66]'
              }`}
            >
              {isRevealed ? char : '_'}
            </div>
          );
        })}
      </div>
    );
  };

  // Total letter count (ignoring spaces & hyphens)
  const letterCount = currentQuestion.answer.replace(/[\s-]/g, '').length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      {/* Top Banner: Round, Match, and Status */}
      <div className="game-card rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-white via-[#FAF5FF] to-white border-2 border-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FEAEC9]/40 flex items-center justify-center border-2 border-[#FEAEC9]">
            <Trophy className="w-6 h-6 text-[#912d52]" />
          </div>
          <div>
            <div className="font-game text-xs uppercase tracking-widest text-[#725e8c] font-bold">
              Round {roundNumber} Showdown • Match #{match.matchNumber}
            </div>
            <h2 className="font-game text-xl sm:text-2xl font-black text-[#2e2640]">
              Head-to-Head Trivia Match
            </h2>
          </div>
        </div>

        {/* Global Controls & Sound */}
        <div className="flex items-center gap-2">
          {turnState === 'reading' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9AD9EA]/30 border border-[#9AD9EA] text-xs font-bold text-[#235868]">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Read Timer: {readCountdown}s</span>
            </div>
          )}

          {(turnState === 'answering' || turnState === 'stealing') && (
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-game font-bold text-sm shadow-sm ${
                answerCountdown <= 5
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#FEAEC9] text-[#3b1c2b]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Response: {answerCountdown}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Contenders Arena (Left vs Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contender 1 Card */}
        <div
          className={`game-card rounded-3xl p-5 border-3 transition-all relative ${
            activeContender?.id === contender1.id
              ? 'border-[#FEAEC9] ring-4 ring-[#FEAEC9]/50 shadow-xl bg-gradient-to-b from-white to-[#FFF0F5]'
              : matchWinner?.id === contender1.id
              ? 'border-emerald-400 bg-emerald-50/70 shadow-lg'
              : 'border-white/80 opacity-95'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-game text-xs font-extrabold px-3 py-1 rounded-full bg-[#FEAEC9]/40 text-[#692942] uppercase tracking-wide">
              Contender 1
            </span>
            {activeContender?.id === contender1.id && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full animate-bounce">
                <Flame className="w-3.5 h-3.5" /> Answering Now!
              </span>
            )}
            {matchWinner?.id === contender1.id && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                🏆 Winner!
              </span>
            )}
          </div>

          <div className="text-center py-2">
            <h3 className="font-game text-2xl font-black text-[#2e2640] truncate">
              {contender1.name}
            </h3>
            <p className="text-xs text-[#6e5d85] font-medium mt-0.5">
              {contender1.department || 'Office Contender'}
            </p>
          </div>

          {/* Action button: Clapped First */}
          {turnState === 'signaled' && (
            <button
              onClick={() => handleContenderClapped(contender1)}
              className="mt-4 w-full game-btn-pink font-game font-bold text-sm text-[#2f1825] py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👏 {contender1.name.split(' ')[0]} Clapped First!</span>
            </button>
          )}

          {/* Active Answering Controls */}
          {activeContender?.id === contender1.id && turnState !== 'resolved' && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
              <button
                onClick={() => handleCorrectAnswer(contender1)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-game font-bold text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" /> Correct Answer!
              </button>
              <button
                onClick={handleWrongAnswerOrTimeout}
                className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-game font-bold text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" /> Wrong
              </button>
            </div>
          )}
        </div>

        {/* Contender 2 Card */}
        <div
          className={`game-card rounded-3xl p-5 border-3 transition-all relative ${
            activeContender?.id === contender2.id
              ? 'border-[#9AD9EA] ring-4 ring-[#9AD9EA]/50 shadow-xl bg-gradient-to-b from-white to-[#F0FAFD]'
              : matchWinner?.id === contender2.id
              ? 'border-emerald-400 bg-emerald-50/70 shadow-lg'
              : 'border-white/80 opacity-95'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-game text-xs font-extrabold px-3 py-1 rounded-full bg-[#9AD9EA]/40 text-[#215664] uppercase tracking-wide">
              Contender 2
            </span>
            {activeContender?.id === contender2.id && (
              <span className="flex items-center gap-1 text-xs font-bold text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded-full animate-bounce">
                <Flame className="w-3.5 h-3.5" /> Answering Now!
              </span>
            )}
            {matchWinner?.id === contender2.id && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                🏆 Winner!
              </span>
            )}
          </div>

          <div className="text-center py-2">
            <h3 className="font-game text-2xl font-black text-[#2e2640] truncate">
              {contender2.name}
            </h3>
            <p className="text-xs text-[#6e5d85] font-medium mt-0.5">
              {contender2.department || 'Office Contender'}
            </p>
          </div>

          {/* Action button: Clapped First */}
          {turnState === 'signaled' && (
            <button
              onClick={() => handleContenderClapped(contender2)}
              className="mt-4 w-full game-btn-blue font-game font-bold text-sm text-[#19323a] py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👏 {contender2.name.split(' ')[0]} Clapped First!</span>
            </button>
          )}

          {/* Active Answering Controls */}
          {activeContender?.id === contender2.id && turnState !== 'resolved' && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
              <button
                onClick={() => handleCorrectAnswer(contender2)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-game font-bold text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" /> Correct Answer!
              </button>
              <button
                onClick={handleWrongAnswerOrTimeout}
                className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-game font-bold text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" /> Wrong
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Signal & Tie-Breaker Bar (During Clap Waiting) */}
      {turnState === 'signaled' && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowRPS(true)}
            className="game-btn-purple font-game font-bold text-sm text-[#2a1e3b] px-5 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>🤝 Clapped at Same Time? Play Rock-Paper-Scissors!</span>
          </button>
        </div>
      )}

      {/* Main Question & Letter Hint Stage Card */}
      <div className="game-card rounded-3xl p-6 sm:p-8 relative border-4 border-white shadow-xl overflow-hidden">
        {/* Signal Pop Overlay if 🔔 signal just popped */}
        {bellJustRung && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#FEAEC9]/80 to-[#9AD9EA]/80 z-20 flex flex-col items-center justify-center animate-bell-pop text-center p-4">
            <span className="text-6xl animate-bounce mb-2">🔔 👏 🔔</span>
            <h2 className="font-game text-3xl sm:text-4xl font-black text-[#2e1c3b] drop-shadow-sm">
              CLAP YOUR HANDS NOW!
            </h2>
            <p className="text-sm font-bold text-[#452857] mt-1">
              First contender to clap earns the right to answer!
            </p>
          </div>
        )}

        {/* Question Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E0EE]">
          <div className="flex items-center gap-2">
            <span className="font-game text-xs font-bold uppercase tracking-wider text-[#796396]">
              {currentQuestion.round === 0 ? 'Bonus Question' : `Round ${roundNumber} • Question ${currentQuestion.number}`}
            </span>
            {currentQuestion.round === 0 && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                Sudden Death Bonus
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Reveal Answer Button with Bell 🔔 */}
            <button
              onClick={() => {
                setIsAnswerRevealed(!isAnswerRevealed);
                if (!isAnswerRevealed && soundEnabled) soundEffects.playBell();
              }}
              title={isAnswerRevealed ? 'Hide Answer' : 'Ring 🔔 & Reveal Answer'}
              className="text-xs font-game font-bold px-3 py-1.5 rounded-xl bg-[#FEAEC9] hover:bg-[#fea0be] text-[#331c28] flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>🔔</span>
              <span>{isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
              {isAnswerRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* The Question Text */}
        <div className="my-4 text-center">
          <p className="text-xs uppercase tracking-widest text-[#8973a6] font-bold mb-2">
            Host Reads Question:
          </p>
          <h3 className="font-game text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2a223a] leading-snug">
            "{currentQuestion.question}"
          </h3>
        </div>

        {/* Letter Blank Line Display (_ _ _ _ _) as requested */}
        <div className="mt-6 pt-4 border-t border-[#E8E0EE] text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#725e8c]">
              Answer Letter Count:
            </span>
            <span className="bg-[#9AD9EA]/40 text-[#1a4a58] text-xs font-bold px-2 py-0.5 rounded-md">
              {letterCount} Letters
            </span>
          </div>

          {/* Letter boxes / lines */}
          {formatLetterHint(currentQuestion.answer, revealedLettersCount)}

          {/* Progressive Hint Reveal Controls */}
          {!isAnswerRevealed && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => {
                  setRevealedLettersCount((prev) => Math.min(prev + 1, currentQuestion.answer.length));
                  if (soundEnabled) soundEffects.playCountdownTick();
                }}
                className="text-xs px-3 py-1 rounded-lg bg-white border border-[#C7BFE8] text-[#55466d] hover:bg-[#FAF5FF] font-medium cursor-pointer"
              >
                💡 Reveal +1 Letter
              </button>
              {revealedLettersCount > 0 && (
                <button
                  onClick={() => setRevealedLettersCount(0)}
                  className="text-xs px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                >
                  Reset Blanks
                </button>
              )}
            </div>
          )}

          {/* Answer Box when Revealed */}
          {isAnswerRevealed && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#FEAEC9]/30 via-white to-[#9AD9EA]/30 border-2 border-[#FEAEC9] animate-bell-pop">
              <span className="text-xs uppercase font-extrabold text-[#7d3b5b] tracking-wider block">
                Official Answer
              </span>
              <span className="font-game text-2xl sm:text-3xl font-black text-[#2e1d38]">
                {currentQuestion.answer}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Signal & Steal Status alerts */}
        <div className="mt-6 pt-4 border-t border-[#E8E0EE] flex flex-wrap items-center justify-between gap-3">
          {/* Signal Buzzer Button */}
          {turnState === 'reading' && (
            <button
              onClick={triggerClapSignal}
              className="game-btn-pink font-game font-bold text-sm text-[#2f1825] px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>🔔 Trigger Clap Signal Now!</span>
            </button>
          )}

          {turnState === 'signaled' && (
            <div className="text-xs font-bold text-[#863e60] animate-pulse flex items-center gap-2">
              <span>🔔 Signal is Active! Contenders: CLAP YOUR HANDS!</span>
            </div>
          )}

          {turnState === 'stealing' && (
            <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span>⚡ Steal Opportunity: {activeContender?.name} has 30 seconds to steal!</span>
            </div>
          )}

          {turnState === 'both_wrong' && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="text-xs text-rose-800 font-bold">
                ❌ Both contenders missed the question!
              </div>
              <button
                onClick={handleNextBonusQuestion}
                className="game-btn-purple font-game font-bold text-xs text-[#2a1e3b] py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Load Sudden Death Bonus Question →</span>
              </button>
            </div>
          )}

          {turnState === 'resolved' && matchWinner && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span className="font-game text-base font-bold text-emerald-900">
                  {matchWinner.name} won this match and advances to Round {roundNumber + 1}!
                </span>
              </div>
              <button
                onClick={() => onMatchComplete(matchWinner)}
                className="game-btn-pink font-game font-bold text-sm text-[#2c1723] py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Advance to Next Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RPS Tie-Breaker Modal */}
      {showRPS && (
        <RPSModal
          contender1={contender1}
          contender2={contender2}
          soundEnabled={soundEnabled}
          onSelectWinner={(winner) => {
            setShowRPS(false);
            handleContenderClapped(winner);
          }}
          onClose={() => setShowRPS(false)}
        />
      )}
    </div>
  );
};
