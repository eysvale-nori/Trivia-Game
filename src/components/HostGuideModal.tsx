import React, { useState } from 'react';
import { X, BookOpen, Terminal, Sparkles, Trophy, HandMetal, Bell, Clock } from 'lucide-react';

interface HostGuideModalProps {
  onClose: () => void;
}

export const HostGuideModal: React.FC<HostGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'flow' | 'vscode'>('rules');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="game-card max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl p-6 relative border-4 border-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E0EE]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FEAEC9]/50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#812a4b]" />
            </div>
            <div>
              <h2 className="font-game text-2xl font-black text-[#2e2640]">
                Host Guide & Instructions
              </h2>
              <p className="text-xs text-[#6e5d85]">
                Official rules, stage-by-stage emcee flow & VS Code quick-start
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close guide"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-3">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-2 px-3 rounded-xl font-game font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-[#FEAEC9] text-[#2f1825] shadow-xs'
                : 'bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Game Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex-1 py-2 px-3 rounded-xl font-game font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-[#9AD9EA] text-[#1a3840] shadow-xs'
                : 'bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Step-by-Step Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('vscode')}
            className={`flex-1 py-2 px-3 rounded-xl font-game font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'vscode'
                ? 'bg-[#C7BFE8] text-[#2c1d3c] shadow-xs'
                : 'bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>VS Code & Setup</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs text-[#3f3154] space-y-3">
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                <h4 className="font-game text-sm font-black text-[#863e60] mb-1 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#FEAEC9]" /> Choose Your Contenders
                </h4>
                <p>
                  The spinning wheel determines the two contenders for each head-to-head match.
                  The selected contenders stand in front of the room, while remaining coworkers sit down,
                  cheer, and refrain from coaching! Once an employee is spun, they are removed from the wheel.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                <h4 className="font-game text-sm font-black text-[#235868] mb-1 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#9AD9EA]" /> Question and Signal
                </h4>
                <p>
                  The host reads the question aloud first during a 15-second timer.
                  When the 🔔 pop-up bell triggers on the screen, it signals the contenders to <strong>clap their hands</strong>!
                  Below each question, a line of blanks (<code>_ _ _ _ _</code>) indicates the exact letter count.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                <h4 className="font-game text-sm font-black text-[#564273] mb-1 flex items-center gap-1.5">
                  <HandMetal className="w-4 h-4 text-[#C7BFE8]" /> First to Answer & 30s Timer
                </h4>
                <p>
                  The contender who claps first earns the right to answer and has <strong>30 seconds</strong> to respond.
                  Host marks Correct or Wrong.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                <h4 className="font-game text-sm font-black text-[#2e2640] mb-1">
                  🤝 Tie-Breaker (Simultaneous Clap)
                </h4>
                <p>
                  If both contenders clap at the exact same instant, they play <strong>Rock-Paper-Scissors</strong>!
                  Use the built-in RPS simulator or play in-person. The winner gets the first chance to answer.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                <h4 className="font-game text-sm font-black text-rose-700 mb-1">
                  ⚡ Steal & Sudden-Death Bonus Question
                </h4>
                <p>
                  If a contender answers incorrectly or times out after 30 seconds, the opponent gets a chance to <strong>steal</strong>!
                  If both contenders fail to answer correctly, the host is automatically provided with a fresh <strong>Bonus Question</strong>!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#FFF5F8] border border-[#FEAEC9]">
                <span className="font-bold text-[#863e60] block mb-0.5">Stage 1: Round 1 (16 Players → 8 Matches)</span>
                Wheel has 16 employees. Spin for Contender 1, then spin for Contender 2. They face off in Match 1 with Question 1. Winner advances to Round 2!
              </div>

              <div className="p-3 rounded-2xl bg-[#F0FAFD] border border-[#9AD9EA]">
                <span className="font-bold text-[#235868] block mb-0.5">Stage 2: Round 2 (8 Players → 4 Matches)</span>
                The 8 winners from Round 1 enter Round 2. Slices adjust dynamically to 8 players. Winners earn Round 2 prizes and advance to Semi-Finals!
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF5FF] border border-[#C7BFE8]">
                <span className="font-bold text-[#564273] block mb-0.5">Stage 3: Round 3 (4 Players → 2 Matches)</span>
                The Final 4 face off in high-stakes office leadership trivia. 2 winners qualify for the Grand Finals!
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FEAEC9]/40 to-[#9AD9EA]/40 border-2 border-white p-3.5 rounded-2xl">
                <span className="font-bold text-[#2e1d38] block mb-0.5">Stage 4: Round 4 Championship (2 Players → 1 Champion 🏆)</span>
                The ultimate 1v1 showdown for the Grand Office Trivia Trophy & Prize!
              </div>
            </div>
          )}

          {activeTab === 'vscode' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#2e2640] text-slate-100 font-mono text-[11px] space-y-1.5 shadow-md">
                <div className="text-emerald-400 font-bold mb-1"># Running in VS Code:</div>
                <div className="text-slate-400">1. Open the project folder in VS Code:</div>
                <div className="bg-slate-800 p-1.5 rounded-lg text-pink-300">code .</div>
                <div className="text-slate-400">2. Install dependencies in terminal (Ctrl+`):</div>
                <div className="bg-slate-800 p-1.5 rounded-lg text-cyan-300">npm install</div>
                <div className="text-slate-400">3. Start the local development server:</div>
                <div className="bg-slate-800 p-1.5 rounded-lg text-emerald-300">npm run dev</div>
                <div className="text-slate-400">4. Open the displayed URL in Chrome/Edge:</div>
                <div className="bg-slate-800 p-1.5 rounded-lg text-purple-300">http://localhost:3000</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8E0EE] space-y-1.5">
                <h4 className="font-game text-xs font-bold text-[#2e2640]">💡 Pro Tips for Office Events:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Projector / TV:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">F11</kbd> in your browser to enter Fullscreen mode for a sleek TV game show experience!</li>
                  <li><strong>Local Storage:</strong> All scores, bracket states, and custom player rosters are automatically saved. Refreshing the browser or reconnecting the projector will never lose progress.</li>
                  <li><strong>Sound:</strong> Connect to office Bluetooth speakers for rich sound effects (spinning clicks, bells, claps, and fanfare!).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E8E0EE] flex justify-end">
          <button
            onClick={onClose}
            className="game-btn-pink font-game font-bold text-xs text-[#2c1723] py-2 px-6 rounded-xl cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
