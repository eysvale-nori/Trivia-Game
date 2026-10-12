import React, { useState } from 'react';
import { Employee } from '../types/game';
import { soundEffects } from '../utils/sound';
import { Swords, RotateCcw, CheckCircle } from 'lucide-react';

interface RPSModalProps {
  contender1: Employee;
  contender2: Employee;
  soundEnabled: boolean;
  onSelectWinner: (winner: Employee) => void;
  onClose: () => void;
}

type RPSChoice = 'rock' | 'paper' | 'scissors';

const CHOICES: { id: RPSChoice; label: string; icon: string }[] = [
  { id: 'rock', label: 'Rock', icon: '🪨' },
  { id: 'paper', label: 'Paper', icon: '📄' },
  { id: 'scissors', label: 'Scissors', icon: '✂️' },
];

export const RPSModal: React.FC<RPSModalProps> = ({
  contender1,
  contender2,
  soundEnabled,
  onSelectWinner,
  onClose,
}) => {
  const [c1Choice, setC1Choice] = useState<RPSChoice | null>(null);
  const [c2Choice, setC2Choice] = useState<RPSChoice | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<Employee | null>(null);

  const simulateQuickRPS = () => {
    setIsRolling(true);
    setResultMessage(null);
    setWinner(null);

    let count = 0;
    const interval = setInterval(() => {
      const r1 = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      const r2 = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      setC1Choice(r1);
      setC2Choice(r2);
      if (soundEnabled) soundEffects.playCountdownTick();
      count++;

      if (count > 8) {
        clearInterval(interval);
        setIsRolling(false);
        finalizeResult(r1, r2);
      }
    }, 120);
  };

  const finalizeResult = (choice1: RPSChoice, choice2: RPSChoice) => {
    if (choice1 === choice2) {
      setResultMessage("It's a Tie! Play again!");
      setWinner(null);
      if (soundEnabled) soundEffects.playBuzzer();
    } else if (
      (choice1 === 'rock' && choice2 === 'scissors') ||
      (choice1 === 'scissors' && choice2 === 'paper') ||
      (choice1 === 'paper' && choice2 === 'rock')
    ) {
      setResultMessage(`${contender1.name} wins with ${choice1.toUpperCase()}!`);
      setWinner(contender1);
      if (soundEnabled) soundEffects.playCorrect();
    } else {
      setResultMessage(`${contender2.name} wins with ${choice2.toUpperCase()}!`);
      setWinner(contender2);
      if (soundEnabled) soundEffects.playCorrect();
    }
  };

  const handleManualPick = (selected: Employee) => {
    setWinner(selected);
    setResultMessage(`${selected.name} won the in-person Rock-Paper-Scissors!`);
    if (soundEnabled) soundEffects.playCorrect();
  };

  const handleConfirm = () => {
    if (winner) {
      onSelectWinner(winner);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="game-card max-w-lg w-full rounded-3xl p-6 sm:p-8 text-center relative border-4 border-[#9AD9EA] animate-bell-pop">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#9AD9EA] to-[#C7BFE8] flex items-center justify-center shadow-md border-2 border-white">
          <Swords className="w-8 h-8 text-[#2e2640]" />
        </div>

        <span className="font-game text-xs uppercase tracking-widest text-[#735d94] font-bold">
          Simultaneous Clap Tie-Breaker
        </span>
        <h2 className="font-game text-2xl font-black text-[#2e2640] mt-1 mb-1">
          Rock • Paper • Scissors!
        </h2>
        <p className="text-xs text-[#5e5170] mb-5">
          Both contenders clapped at the exact same moment! Play RPS to decide who answers first.
        </p>

        {/* Both Contenders Arena */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Contender 1 */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              winner?.id === contender1.id
                ? 'bg-[#FEAEC9]/30 border-[#FEAEC9] shadow-md scale-102'
                : 'bg-white/70 border-[#E8E0EE]'
            }`}
          >
            <div className="text-xs font-bold text-[#8e4963] uppercase">Contender 1</div>
            <div className="font-game text-base font-extrabold text-[#2e2640] truncate mb-2">
              {contender1.name}
            </div>
            <div className="text-4xl my-2">
              {c1Choice
                ? CHOICES.find((c) => c.id === c1Choice)?.icon
                : '✊'}
            </div>
            <button
              onClick={() => handleManualPick(contender1)}
              className="mt-2 w-full text-xs py-1.5 px-2 rounded-lg bg-[#FEAEC9] hover:bg-[#fea0be] text-[#331c28] font-bold cursor-pointer"
            >
              Won In-Person
            </button>
          </div>

          {/* Contender 2 */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              winner?.id === contender2.id
                ? 'bg-[#9AD9EA]/30 border-[#9AD9EA] shadow-md scale-102'
                : 'bg-white/70 border-[#E8E0EE]'
            }`}
          >
            <div className="text-xs font-bold text-[#357485] uppercase">Contender 2</div>
            <div className="font-game text-base font-extrabold text-[#2e2640] truncate mb-2">
              {contender2.name}
            </div>
            <div className="text-4xl my-2">
              {c2Choice
                ? CHOICES.find((c) => c.id === c2Choice)?.icon
                : '✋'}
            </div>
            <button
              onClick={() => handleManualPick(contender2)}
              className="mt-2 w-full text-xs py-1.5 px-2 rounded-lg bg-[#9AD9EA] hover:bg-[#86cee0] text-[#1c363d] font-bold cursor-pointer"
            >
              Won In-Person
            </button>
          </div>
        </div>

        {/* Result Announcement */}
        {resultMessage && (
          <div className="mb-5 p-3 rounded-2xl bg-[#FAF5FF] border border-[#C7BFE8] text-sm font-bold text-[#45365e]">
            {resultMessage}
          </div>
        )}

        {/* Simulation / Confirmation buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={simulateQuickRPS}
            disabled={isRolling}
            className="flex-1 w-full game-btn-purple font-game font-bold text-sm text-[#2a1e3b] py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Throwing...' : 'Roll Virtual RPS'}</span>
          </button>

          {winner && (
            <button
              onClick={handleConfirm}
              className="flex-1 w-full game-btn-pink font-game font-bold text-sm text-[#2f1b29] py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Let {winner.name.split(' ')[0]} Answer →</span>
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-xs text-[#7d6f8f] underline hover:text-[#423753] cursor-pointer"
        >
          Cancel Tie-Breaker
        </button>
      </div>
    </div>
  );
};
