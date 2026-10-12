import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Employee } from '../types/game';
import { soundEffects } from '../utils/sound';
import { Play, Sparkles, UserCheck } from 'lucide-react';

interface SpinningWheelProps {
  employees: Employee[];
  targetSlot: 'contender1' | 'contender2';
  roundNumber: number;
  matchNumber: number;
  onSelectEmployee: (employee: Employee) => void;
  soundEnabled: boolean;
  disabled?: boolean;
}

// Visual palette matching the requested colors
const SLICE_COLORS = [
  '#FEAEC9', // Pink
  '#9AD9EA', // Light Blue
  '#C7BFE8', // Lavender
  '#FCE4EC', // Soft Pink
  '#B2EBF2', // Soft Cyan
  '#D1C4E9', // Soft Purple
  '#FFD1DC', // Pastel Rose
  '#C8E6C9', // Fresh Mint accent for crisp readability
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  employees,
  targetSlot,
  roundNumber,
  matchNumber,
  onSelectEmployee,
  soundEnabled,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Employee | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animation state references to avoid stale closure during requestAnimationFrame
  const rotationRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastSliceIndexRef = useRef<number>(-1);

  // Calculate slice angle
  const numSlices = Math.max(employees.length, 1);
  const arcSize = (2 * Math.PI) / numSlices;

  // Draw wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 24;

    ctx.clearRect(0, 0, width, height);

    // If no employees left in wheel
    if (employees.length === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#E8E0EE';
      ctx.fill();
      ctx.strokeStyle = '#C7BFE8';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.font = 'bold 18px "Fredoka", sans-serif';
      ctx.fillStyle = '#6b5b95';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No contenders remaining!', centerX, centerY);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRef.current);

    // Draw outer decorative ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#FAF5FF';
    ctx.fill();
    ctx.strokeStyle = '#C7BFE8';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Draw slices
    employees.forEach((emp, i) => {
      const startAngle = i * arcSize;
      const endAngle = startAngle + arcSize;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const color = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fillStyle = color;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Contrast text styling
      ctx.font = employees.length > 10 ? 'bold 13px "Fredoka", sans-serif' : 'bold 15px "Fredoka", sans-serif';
      ctx.fillStyle = '#2d2440';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 4;

      // Truncate name if too long for slice
      let displayName = emp.name;
      if (displayName.length > 15) {
        displayName = displayName.substring(0, 13) + '…';
      }

      ctx.fillText(displayName, radius - 26, 0);
      ctx.restore();
    });

    // Outer rim studs/pegs
    const numPins = Math.max(employees.length * 2, 16);
    for (let p = 0; p < numPins; p++) {
      const pinAngle = (p * 2 * Math.PI) / numPins;
      const pinX = Math.cos(pinAngle) * (radius + 6);
      const pinY = Math.sin(pinAngle) * (radius + 6);

      ctx.beginPath();
      ctx.arc(pinX, pinY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#FEAEC9';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // Draw center hub / 3D buzzer core
    ctx.save();
    ctx.translate(centerX, centerY);

    // Hub drop shadow
    ctx.beginPath();
    ctx.arc(0, 3, 44, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(154, 217, 234, 0.4)';
    ctx.fill();

    // Hub outer rim
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#9AD9EA';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Hub inner button (pink game buzzer)
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#FEAEC9';
    ctx.fill();
    ctx.strokeStyle = '#e685a4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub highlight shine
    ctx.beginPath();
    ctx.ellipse(-10, -10, 12, 6, -Math.PI / 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    ctx.restore();

    // Top Pointer Arrow (fixed at 12 o'clock pointing down into wheel)
    ctx.save();
    ctx.translate(centerX, 16);

    // Pointer shadow
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(16, -6);
    ctx.lineTo(0, 28);
    ctx.closePath();
    ctx.fillStyle = 'rgba(74, 57, 107, 0.25)';
    ctx.fill();

    // Pointer body
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(14, -8);
    ctx.lineTo(0, 24);
    ctx.closePath();
    ctx.fillStyle = '#FEAEC9';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Pointer mini jewel
    ctx.beginPath();
    ctx.arc(0, -2, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }, [employees, arcSize]);

  // Initial render and redraw on employee changes
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Spin the wheel function
  const spinWheel = () => {
    if (isSpinning || employees.length === 0 || disabled) return;

    setIsSpinning(true);
    setSelectedWinner(null);
    setShowCelebration(false);

    // Pick random target slice
    const targetIndex = Math.floor(Math.random() * employees.length);
    const targetEmployee = employees[targetIndex];

    // Compute rotation angle needed so that targetIndex lands directly at 12 o'clock pointer
    // Pointer is at 270 degrees (3*PI/2) or top.
    // Each slice starts at targetIndex * arcSize. Center of slice is targetIndex * arcSize + arcSize / 2.
    // When wheel rotates by R, effective angle at pointer is: (3*PI/2 - R) mod 2PI.
    // So target R % 2PI = 3*PI/2 - (targetIndex * arcSize + arcSize / 2).
    const centerOfSlice = targetIndex * arcSize + arcSize / 2;
    const pointerAngle = (3 * Math.PI) / 2; // top of circle
    let finalAngleMod = (pointerAngle - centerOfSlice) % (2 * Math.PI);
    if (finalAngleMod < 0) finalAngleMod += 2 * Math.PI;

    // Add 5 to 7 full rotations for excitement
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    const currentRot = rotationRef.current;
    const currentRotMod = currentRot % (2 * Math.PI);
    let delta = finalAngleMod - currentRotMod;
    if (delta < 0) delta += 2 * Math.PI;

    const totalRotation = fullSpins + delta;
    const startRotation = currentRot;
    const spinDuration = 4800; // ~4.8 seconds
    const startTime = performance.now();

    // Track ticks
    lastSliceIndexRef.current = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Ease Out Quartic for ultra-smooth realistic friction deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);

      const currentAngle = startRotation + totalRotation * easeOut;
      rotationRef.current = currentAngle;
      drawWheel();

      // Check slice tick sound
      // Effective pointer angle: (3*PI/2 - currentAngle) % 2PI
      let effectiveAngle = ((3 * Math.PI) / 2 - currentAngle) % (2 * Math.PI);
      if (effectiveAngle < 0) effectiveAngle += 2 * Math.PI;
      const currentSlice = Math.floor(effectiveAngle / arcSize);

      if (currentSlice !== lastSliceIndexRef.current) {
        lastSliceIndexRef.current = currentSlice;
        if (soundEnabled) {
          // Pitch slightly increases then slows down with deceleration
          soundEffects.playWheelTick(1 - progress * 0.4);
        }
      }

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished!
        setIsSpinning(false);
        setSelectedWinner(targetEmployee);
        setShowCelebration(true);

        if (soundEnabled) {
          soundEffects.playWheelStop();
        }

        // Confetti burst
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FEAEC9', '#9AD9EA', '#C7BFE8', '#FFD1DC', '#FFFFFF'],
          });
        } catch {
          // ignore
        }
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
  };

  // Confirm selection and assign to match slot
  const handleConfirmContender = () => {
    if (!selectedWinner) return;
    onSelectEmployee(selectedWinner);
    setShowCelebration(false);
    setSelectedWinner(null);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Round & Match Indicator */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="font-game text-sm text-[#725e8c] font-semibold uppercase tracking-wider">
            Round {roundNumber} • Match #{matchNumber}
          </span>
          <span className="bg-[#FEAEC9]/40 text-[#4c3560] text-xs font-semibold px-2 py-0.5 rounded-full">
            Wheel Pool: {employees.length} {employees.length === 1 ? 'Contender' : 'Contenders'}
          </span>
        </div>
        <div className="text-xs font-medium text-[#6c5980]">
          Selecting: <span className="font-bold text-[#c4537b]">{targetSlot === 'contender1' ? 'Contender 1' : 'Contender 2'}</span>
        </div>
      </div>

      {/* Wheel Canvas Container */}
      <div className="relative p-2 rounded-full bg-gradient-to-b from-white/90 to-[#E8E0EE]/70 shadow-xl border-4 border-white/80">
        <canvas
          ref={canvasRef}
          width={440}
          height={440}
          className="max-w-full h-auto drop-shadow-md rounded-full cursor-pointer transition-transform duration-200"
          onClick={!isSpinning && employees.length > 0 && !disabled ? spinWheel : undefined}
          title={isSpinning ? 'Wheel is spinning!' : 'Click to spin the wheel!'}
        />

        {/* Floating Spin Button Overlay at Center for easy tapping */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || employees.length === 0 || disabled}
          aria-label="Spin the Wheel"
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex flex-col items-center justify-center font-game font-bold text-slate-800 transition-all duration-200 cursor-pointer ${
            isSpinning
              ? 'opacity-80 scale-95 pointer-events-none'
              : 'hover:scale-105 active:scale-95 shadow-lg'
          }`}
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #FEAEC9 60%, #e685a4 100%)',
            border: '4px solid #ffffff',
            boxShadow: '0 6px 16px rgba(230, 133, 164, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          }}
        >
          <Play className={`w-5 h-5 text-slate-800 fill-slate-800 ${isSpinning ? 'animate-spin' : ''}`} />
          <span className="text-[11px] uppercase tracking-wide font-extrabold text-[#3a2238] mt-0.5">
            {isSpinning ? 'Spinning' : 'SPIN'}
          </span>
        </button>
      </div>

      {/* Action Controls below wheel */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={spinWheel}
          disabled={isSpinning || employees.length === 0 || disabled}
          className="game-btn-pink font-game font-bold text-[#2d1b32] px-6 py-3 rounded-2xl flex items-center gap-2 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-[#8f2b53]" />
          <span>{isSpinning ? 'Determining Contender...' : `Spin for ${targetSlot === 'contender1' ? 'Contender 1' : 'Contender 2'}`}</span>
        </button>
      </div>

      {/* Winner Pop-up / Hand-off Modal */}
      {showCelebration && selectedWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="game-card max-w-md w-full rounded-3xl p-6 sm:p-8 text-center relative border-4 border-[#FEAEC9] animate-bell-pop">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#FEAEC9] to-[#9AD9EA] flex items-center justify-center shadow-lg border-4 border-white">
              <UserCheck className="w-10 h-10 text-white" />
            </div>

            <span className="font-game text-xs uppercase tracking-widest text-[#7a488f] font-bold">
              Contender Selected!
            </span>
            <h3 className="font-game text-3xl font-extrabold text-[#2e2640] mt-1 mb-2">
              {selectedWinner.name}
            </h3>
            {selectedWinner.department && (
              <p className="text-sm text-[#665a78] font-medium mb-4">
                {selectedWinner.department}
              </p>
            )}

            <div className="p-3 bg-[#E8E0EE]/70 rounded-2xl border border-[#C7BFE8] text-xs text-[#4b3c5e] mb-6">
              ✨ <strong>Next Step:</strong> {selectedWinner.name} will now step forward to stand in front as{' '}
              <strong>{targetSlot === 'contender1' ? 'Contender 1' : 'Contender 2'}</strong>. They are now removed from this round's wheel!
            </div>

            <button
              onClick={handleConfirmContender}
              className="w-full game-btn-pink font-game font-bold text-lg text-[#2e1d32] py-3.5 px-6 rounded-2xl cursor-pointer"
            >
              Confirm & Assign to Match →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
