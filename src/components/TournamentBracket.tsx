import React from 'react';
import { Match, Employee } from '../types/game';
import { Trophy, CheckCircle, Clock } from 'lucide-react';

interface TournamentBracketProps {
  matchesByRound: Record<number, Match[]>;
  currentRound: number;
  currentMatchIndex: number;
  champion: Employee | null;
  prizes: {
    round1: string;
    round2: string;
    round3: string;
    round4: string;
  };
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matchesByRound,
  currentRound,
  currentMatchIndex,
  champion,
  prizes,
}) => {
  const rounds = [
    { num: 1, name: 'Round 1: 16 Players', matchesCount: 8, prize: prizes.round1 },
    { num: 2, name: 'Round 2: Quarter-Finals (8)', matchesCount: 4, prize: prizes.round2 },
    { num: 3, name: 'Round 3: Semi-Finals (4)', matchesCount: 2, prize: prizes.round3 },
    { num: 4, name: 'Round 4: Grand Finals (2)', matchesCount: 1, prize: prizes.round4 },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Champion Podium if crowned */}
      {champion && (
        <div className="game-card rounded-3xl p-6 sm:p-8 text-center bg-gradient-to-r from-[#FEAEC9]/40 via-white to-[#9AD9EA]/40 border-4 border-[#FEAEC9] shadow-2xl animate-bell-pop">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#FEAEC9] via-[#C7BFE8] to-[#9AD9EA] flex items-center justify-center shadow-lg border-4 border-white">
            <Trophy className="w-12 h-12 text-[#46235b]" />
          </div>
          <span className="font-game text-xs font-bold uppercase tracking-widest text-[#7b3e64]">
            Official Office Trivia Champion
          </span>
          <h2 className="font-game text-3xl sm:text-4xl font-black text-[#2e1c3b] mt-1 mb-2">
            🏆 {champion.name} 🏆
          </h2>
          {champion.department && (
            <p className="text-sm font-semibold text-[#5c4974] mb-3">
              Representing {champion.department}
            </p>
          )}
          <div className="inline-block px-4 py-2 rounded-2xl bg-[#FEAEC9] text-[#3b172a] font-game font-bold text-sm shadow-md">
            Grand Prize: {prizes.round4}
          </div>
        </div>
      )}

      {/* Bracket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rounds.map((roundInfo) => {
          const roundMatches = matchesByRound[roundInfo.num] || [];
          const isCurrentActiveRound = currentRound === roundInfo.num;
          const isPastRound = currentRound > roundInfo.num;

          return (
            <div
              key={roundInfo.num}
              className={`rounded-3xl p-4 flex flex-col gap-3 transition-all ${
                isCurrentActiveRound
                  ? 'bg-white/90 border-3 border-[#FEAEC9] shadow-lg ring-2 ring-[#FEAEC9]/30'
                  : 'bg-white/60 border border-[#C7BFE8]/60 shadow-sm'
              }`}
            >
              {/* Round Column Header */}
              <div className="pb-2 border-b border-[#E8E0EE]">
                <div className="flex items-center justify-between">
                  <span className="font-game text-xs font-black uppercase tracking-wider text-[#4d3d63]">
                    {roundInfo.name}
                  </span>
                  {isCurrentActiveRound && (
                    <span className="bg-[#FEAEC9] text-[#341624] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                  {isPastRound && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DONE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#715c87] truncate mt-1">
                  Prize: {roundInfo.prize}
                </div>
              </div>

              {/* Match Cards List */}
              <div className="flex flex-col gap-3">
                {roundMatches.map((m, mIdx) => {
                  const isCurrentMatch = isCurrentActiveRound && currentMatchIndex === mIdx;

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl border-2 transition-all text-xs ${
                        isCurrentMatch
                          ? 'border-[#9AD9EA] bg-[#F0FAFD] shadow-md ring-2 ring-[#9AD9EA]/40'
                          : m.winner
                          ? 'border-emerald-200 bg-white/80'
                          : 'border-slate-200 bg-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                        <span>Match #{m.matchNumber}</span>
                        {m.winner ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        ) : isCurrentMatch ? (
                          <span className="text-[#205e6f] flex items-center gap-1 font-extrabold animate-pulse">
                            <Clock className="w-3 h-3" /> In Progress
                          </span>
                        ) : (
                          <span>Upcoming</span>
                        )}
                      </div>

                      {/* Contender 1 Slot */}
                      <div
                        className={`p-1.5 rounded-xl mb-1 flex items-center justify-between font-game font-semibold truncate ${
                          m.winner?.id === m.contender1?.id
                            ? 'bg-emerald-100 text-emerald-950 font-bold'
                            : 'bg-white/70 text-slate-700'
                        }`}
                      >
                        <span className="truncate">
                          {m.contender1 ? m.contender1.name : '— Pending Spin —'}
                        </span>
                        {m.winner?.id === m.contender1?.id && (
                          <span className="text-xs">🏆</span>
                        )}
                      </div>

                      {/* Contender 2 Slot */}
                      <div
                        className={`p-1.5 rounded-xl flex items-center justify-between font-game font-semibold truncate ${
                          m.winner?.id === m.contender2?.id
                            ? 'bg-emerald-100 text-emerald-950 font-bold'
                            : 'bg-white/70 text-slate-700'
                        }`}
                      >
                        <span className="truncate">
                          {m.contender2 ? m.contender2.name : '— Pending Spin —'}
                        </span>
                        {m.winner?.id === m.contender2?.id && (
                          <span className="text-xs">🏆</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
