import React, { useState } from 'react';
import { Employee } from '../types/game';
import { DEFAULT_EMPLOYEES } from '../data/questions';
import { X, Users, Gift, RotateCcw, Plus, Trash2, Check } from 'lucide-react';

interface RosterManagerModalProps {
  employees: Employee[];
  prizes: {
    round1: string;
    round2: string;
    round3: string;
    round4: string;
  };
  onSave: (employees: Employee[], prizes: { round1: string; round2: string; round3: string; round4: string }) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  employees,
  prizes,
  onSave,
  onResetGame,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'prizes'>('roster');
  const [rosterList, setRosterList] = useState<Employee[]>([...employees]);
  const [prizeList, setPrizeList] = useState({ ...prizes });
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleNameChange = (id: string, newName: string) => {
    setRosterList((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, name: newName } : emp))
    );
  };

  const handleDeptChange = (id: string, newDept: string) => {
    setRosterList((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, department: newDept } : emp))
    );
  };

  const handleAddEmployee = () => {
    if (rosterList.length >= 16) return;
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: `Employee ${rosterList.length + 1}`,
      department: 'Office Team',
    };
    setRosterList([...rosterList, newEmp]);
  };

  const handleRemoveEmployee = (id: string) => {
    if (rosterList.length <= 2) return;
    setRosterList((prev) => prev.filter((emp) => emp.id !== id));
  };

  const handleApplyBulk = () => {
    const lines = bulkInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length > 0) {
      const updated: Employee[] = lines.slice(0, 16).map((name, i) => ({
        id: `emp-${i + 1}`,
        name: name,
        department: 'Team Member',
      }));
      setRosterList(updated);
      setShowBulkInput(false);
      setBulkInput('');
    }
  };

  const handleLoadDefaults = () => {
    setRosterList([...DEFAULT_EMPLOYEES]);
  };

  const handleSaveAll = () => {
    onSave(rosterList, prizeList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="game-card max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl p-6 relative border-4 border-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E0EE]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="font-game text-2xl font-black text-[#2e2640]">
                Game Settings & Roster
              </h2>
              <p className="text-xs text-[#6e5d85]">
                Manage the 16 employee contenders and round prize pool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 my-4">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-2 px-4 rounded-xl font-game font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-[#FEAEC9] text-[#2f1825] shadow-sm'
                : 'bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contender Roster ({rosterList.length}/16)</span>
          </button>
          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex-1 py-2 px-4 rounded-xl font-game font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'prizes'
                ? 'bg-[#9AD9EA] text-[#1a3840] shadow-sm'
                : 'bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Prize Pool</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'roster' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#5f4f75]">
                  Contenders for Round 1 Spinning Wheel
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#C7BFE8] text-[#55466d] hover:bg-[#FAF5FF] font-medium cursor-pointer"
                  >
                    {showBulkInput ? 'Close Quick Paste' : '📋 Quick Paste Names'}
                  </button>
                  <button
                    onClick={handleLoadDefaults}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#C7BFE8] text-[#55466d] hover:bg-[#FAF5FF] font-medium cursor-pointer"
                  >
                    Reset to Default 16
                  </button>
                </div>
              </div>

              {/* Bulk paste box */}
              {showBulkInput && (
                <div className="p-3 rounded-2xl bg-[#FAF5FF] border border-[#C7BFE8] flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#4c3a66]">
                    Paste up to 16 employee names (one per line):
                  </span>
                  <textarea
                    rows={5}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Alice Smith&#10;Bob Jones&#10;Charlie Brown..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FEAEC9]"
                  />
                  <button
                    onClick={handleApplyBulk}
                    className="self-end game-btn-pink font-game font-bold text-xs text-[#2f1825] py-1.5 px-4 rounded-xl cursor-pointer"
                  >
                    Apply Names
                  </button>
                </div>
              )}

              {/* Roster Inputs List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rosterList.map((emp, index) => (
                  <div
                    key={emp.id}
                    className="p-2.5 rounded-2xl bg-white/80 border border-[#E8E0EE] flex items-center gap-2 shadow-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#E8E0EE] text-[11px] font-bold text-[#55436e] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <input
                        type="text"
                        value={emp.name}
                        onChange={(e) => handleNameChange(emp.id, e.target.value)}
                        placeholder="Contender Name"
                        className="text-xs font-bold text-slate-800 bg-transparent border-b border-slate-200 focus:outline-none focus:border-[#FEAEC9]"
                      />
                      <input
                        type="text"
                        value={emp.department || ''}
                        onChange={(e) => handleDeptChange(emp.id, e.target.value)}
                        placeholder="Department / Role"
                        className="text-[11px] text-slate-500 bg-transparent border-none focus:outline-none"
                      />
                    </div>
                    {rosterList.length > 2 && (
                      <button
                        onClick={() => handleRemoveEmployee(emp.id)}
                        aria-label={`Remove contender ${emp.name}`}
                        className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {rosterList.length < 16 && (
                <button
                  onClick={handleAddEmployee}
                  className="mt-2 py-2 px-4 rounded-xl border-2 border-dashed border-[#C7BFE8] text-xs font-bold text-[#624d7c] hover:bg-white/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Employee ({rosterList.length}/16)
                </button>
              )}
            </div>
          )}

          {activeTab === 'prizes' && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-[#5f4f75]">
                Customize the Reward for Each Tournament Stage:
              </span>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                  <label className="text-xs font-bold text-[#863e60] block mb-1">
                    Round 1 Qualifiers Prize:
                  </label>
                  <input
                    type="text"
                    value={prizeList.round1}
                    onChange={(e) => setPrizeList({ ...prizeList, round1: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                  <label className="text-xs font-bold text-[#235868] block mb-1">
                    Round 2 Semi-Finalists Prize:
                  </label>
                  <input
                    type="text"
                    value={prizeList.round2}
                    onChange={(e) => setPrizeList({ ...prizeList, round2: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E0EE]">
                  <label className="text-xs font-bold text-[#564273] block mb-1">
                    Round 3 Finalists Prize:
                  </label>
                  <input
                    type="text"
                    value={prizeList.round3}
                    onChange={(e) => setPrizeList({ ...prizeList, round3: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-[#FEAEC9] shadow-xs">
                  <label className="text-xs font-bold text-[#a6305a] block mb-1">
                    🏆 Round 4 Grand Champion Prize:
                  </label>
                  <input
                    type="text"
                    value={prizeList.round4}
                    onChange={(e) => setPrizeList({ ...prizeList, round4: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-[#2d1b28]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-[#E8E0EE] flex flex-wrap items-center justify-between gap-3">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-bold">Reset full game?</span>
              <button
                onClick={() => {
                  onResetGame();
                  onClose();
                }}
                className="py-1.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="py-1.5 px-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart New Tournament
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-white/80 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="game-btn-pink font-game font-bold text-xs text-[#2c1723] py-2.5 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
