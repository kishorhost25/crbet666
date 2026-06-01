import React, { useState, useEffect } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { X, Trophy, Coins, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SlotMachineModalProps {
  game: GameDefinition;
  user: UserProfile;
  onBetPlaced: (betAmount: number, winAmount: number, multiplier: number, resultStr: 'win' | 'loss') => void;
  onClose: () => void;
}

const SYMBOLS = [
  { char: '👑', val: 10, label: 'Wild', color: 'text-yellow-400' },
  { char: '💎', val: 7, label: 'Scatter', color: 'text-cyan-400' },
  { char: '7️⃣', val: 5, label: 'Lucky 7', color: 'text-red-500' },
  { char: '🔔', val: 3, label: 'Bell', color: 'text-amber-400' },
  { char: '🍒', val: 2.5, label: 'Cherry', color: 'text-pink-500' },
  { char: '♠️', val: 1.5, label: 'Ace', color: 'text-blue-400' },
  { char: '🪙', val: 1.2, label: 'Coin', color: 'text-yellow-500' },
];

export default function SlotMachineModal({ game, user, onBetPlaced, onClose }: SlotMachineModalProps) {
  const [bet, setBet] = useState<number>(50);
  const [reels, setReels] = useState<string[][]>([
    ['🍒', '7️⃣', '♠️'],
    ['🔔', '👑', '🍒'],
    ['💎', '🪙', '🔔'],
  ]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<{
    winAmount: number;
    multiplier: number;
    lines: string[];
    isJackpot: boolean;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Play browser sound with custom frequency synth for retro casino effects
  const playBeep = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocks audio
    }
  };

  const handleSpinResultAudio = (winAmount: number) => {
    if (winAmount > 0) {
      // Escalating victory sound cascading
      setTimeout(() => playBeep(261.63, 0.1, 'square'), 0); // C4
      setTimeout(() => playBeep(329.63, 0.1, 'square'), 100); // E4
      setTimeout(() => playBeep(392.00, 0.1, 'square'), 200); // G4
      setTimeout(() => playBeep(523.25, 0.25, 'triangle'), 300); // C5
    } else {
      // Sad de-escalation sound
      setTimeout(() => playBeep(220.00, 0.15, 'sine'), 0); // A3
      setTimeout(() => playBeep(174.61, 0.25, 'sine'), 120); // F3
    }
  };

  const handleSpinClick = () => {
    if (isSpinning) return;
    if (user.balance < bet) {
      playBeep(150, 0.3, 'sawtooth');
      alert('আপনার ব্যালেন্স পর্যাপ্ত নয়! অনুগ্রহ করে আমানত করুন।');
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);

    // Dynamic rotation intervals to simulate scrolling reels page
    let counter = 0;
    const interval = setInterval(() => {
      setReels(() => [
        Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
        Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
        Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
      ]);
      playBeep(440 + counter * 30, 0.04, 'sine');
      counter++;
    }, 80);

    setTimeout(() => {
      clearInterval(interval);

      // Enforce custom slot results with probabilistic modifiers for simulated fun!
      // 35% chance of a winning spin combination
      const winRoller = Math.random();
      let finalReels: string[][];
      let won = false;

      if (winRoller < 0.38) {
        // Prepare winning array combinations
        won = true;
        const matchingSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char;
        
        // Match a payline! E.g. middle horizontal row
        finalReels = [
          Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
          [matchingSymbol, matchingSymbol, matchingSymbol], // matched horizontal row!
          Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
        ];

        // 10% chance that it matches another line as well (e.g. cross diagonal match!)
        if (Math.random() < 0.15) {
          finalReels[0][0] = matchingSymbol;
          finalReels[2][2] = matchingSymbol;
        }
      } else {
        // Pure random set (low likelihood of winning by natural chance)
        finalReels = [
          Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
          Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
          Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char),
        ];
      }

      setReels(finalReels);

      // Calculate winnings
      let linesMatched: string[] = [];
      let totalMultiplier = 0;

      // 1. Horizontal matches evaluation
      for (let row = 0; row < 3; row++) {
        const s1 = finalReels[row][0];
        const s2 = finalReels[row][1];
        const s3 = finalReels[row][2];

        // Wild Crown matches anything
        const isWild = (char: string) => char === '👑';
        
        if (
          (s1 === s2 && s2 === s3) ||
          (isWild(s1) && s2 === s3) ||
          (s1 === s2 && isWild(s3)) ||
          (s1 === s3 && isWild(s2)) ||
          (isWild(s1) && isWild(s2)) ||
          (isWild(s2) && isWild(s3))
        ) {
          const matchedChar = isWild(s2) ? (isWild(s1) ? s3 : s1) : s2;
          const matchedSymbolDef = SYMBOLS.find(s => s.char === matchedChar) || SYMBOLS[SYMBOLS.length - 1];
          // If all are wild, use high payout!
          const mul = matchedSymbolDef.val * (row === 1 ? 1.5 : 1.0);
          totalMultiplier += mul;
          linesMatched.push(`Row ${row + 1} (${matchedSymbolDef.label}) - ${mul}x`);
        }
      }

      // 2. Diagonal matches evaluation
      const d1_0 = finalReels[0][0];
      const d1_1 = finalReels[1][1];
      const d1_2 = finalReels[2][2];
      if (d1_0 === d1_1 && d1_1 === d1_2) {
        const matchedSymbolDef = SYMBOLS.find(s => s.char === d1_1) || SYMBOLS[SYMBOLS.length - 1];
        totalMultiplier += matchedSymbolDef.val * 1.5;
        linesMatched.push(`Diagonal Down - ${matchedSymbolDef.val * 1.5}x`);
      }

      const d2_0 = finalReels[2][0];
      const d2_1 = finalReels[1][1];
      const d2_2 = finalReels[0][2];
      if (d2_0 === d2_1 && d2_1 === d2_2) {
        const matchedSymbolDef = SYMBOLS.find(s => s.char === d2_1) || SYMBOLS[SYMBOLS.length - 1];
        totalMultiplier += matchedSymbolDef.val * 1.5;
        linesMatched.push(`Diagonal Up - ${matchedSymbolDef.val * 1.5}x`);
      }

      const finalWin = Math.floor(bet * totalMultiplier);
      const isJackpot = totalMultiplier >= 10;

      setSpinResult({
        winAmount: finalWin,
        multiplier: Number(totalMultiplier.toFixed(1)),
        lines: linesMatched,
        isJackpot,
      });

      // Submit results to update stats/balance in user state integration
      onBetPlaced(bet, finalWin, totalMultiplier, finalWin > 0 ? 'win' : 'loss');
      handleSpinResultAudio(finalWin);
      setIsSpinning(false);
    }, 1400);
  };

  const currentBetOptions = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 bg-black/85 z-[2100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#1f262e] w-full max-w-[480px] rounded-2xl border border-[#2d3844] overflow-hidden shadow-2xl"
      >
        {/* Banner with matched Game Provider Accent */}
        <div className="p-4 bg-[#262f3a] flex items-center justify-between border-b border-[#2d3844]">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white rounded-lg p-2 text-xs font-bold shadow-md">
              {game.provider}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#f1b80d] flex items-center gap-2">
                {game.title} Slots <Sparkles className="w-4 h-4 text-yellow-400" />
              </h3>
              <p className="text-xs text-gray-400">অনলাইন রিয়েল-টাইম মাল্টিপ্লায়ার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-[#303a47] p-2 rounded-full cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Status / Audio */}
        <div className="px-5 py-2.5 bg-[#171c22] flex items-center justify-between text-xs text-gray-400 border-b border-[#2d3844]">
          <div className="flex items-center gap-2 font-semibold">
            <Coins className="w-4 h-4 text-emerald-500" />
            ব্যালেন্স: <span className="text-white text-sm font-bold">৳{user.balance.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer text-gray-400 hover:text-white"
          >
            <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'} text-emerald-500`}></i>
            {soundEnabled ? 'শব্দ সচল' : 'শব্দ অচল'}
          </button>
        </div>

        {/* Slot Reels Panel holding results */}
        <div className="p-6 bg-[#161a20] flex flex-col items-center">
          <div className="relative bg-[#0d1013] border-4 border-[#2d3a47] rounded-2xl p-4 w-full shadow-inner max-w-sm">
            {/* Horizontal matched guide markers */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#00b986]/30 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-[28%] left-0 right-0 h-0.5 bg-yellow-500/10 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-[72%] left-0 right-0 h-0.5 bg-yellow-500/10 -translate-y-1/2 pointer-events-none" />

            <div className="grid grid-cols-3 gap-3 relative z-10">
              {reels.map((column, colIndex) => (
                <div key={colIndex} className="bg-[#1b2128] rounded-xl py-4 border border-[#2b3541] flex flex-col gap-4 items-center justify-center overflow-hidden h-[190px]">
                  {column.map((symbolChar, rowIndex) => {
                    const symObj = SYMBOLS.find(s => s.char === symbolChar) || SYMBOLS[SYMBOLS.length - 1];
                    return (
                      <motion.div
                        key={rowIndex}
                        animate={isSpinning ? { y: [0, 80, -80, 0], scale: [1, 0.9, 1.1, 1] } : {}}
                        transition={{ duration: 0.15, repeat: isSpinning ? Infinity : 0 }}
                        className="text-4xl select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center"
                      >
                        <span>{symbolChar}</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mt-1">
                          {symObj.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Winning payout message box overlay */}
          <div className="h-16 w-full flex items-center justify-center mt-5 text-center px-4">
            <AnimatePresence mode="wait">
              {isSpinning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[#00b986] font-bold animate-pulse text-sm font-sans"
                >
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  রিল ঘুরছে... কপাল পরীক্ষা করুন!
                </motion.div>
              )}

              {!isSpinning && spinResult && spinResult.winAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-550/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-emerald-400 bg-emerald-950/25 w-full flex flex-col items-center"
                >
                  <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-400">
                    <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    শুভ জয়! +৳{spinResult.winAmount.toLocaleString()} ({spinResult.multiplier}x)
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                    {spinResult.lines.join(', ')}
                  </div>
                </motion.div>
              )}

              {!isSpinning && spinResult && spinResult.winAmount === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm font-medium border border-red-500/10 bg-red-950/15 p-2 rounded-xl w-full"
                >
                  হায়! জিততে পারেননি। আবার চেষ্টা করুন!
                </motion.div>
              )}

              {!isSpinning && !spinResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-400 text-xs text-center flex items-center gap-1.5 max-w-[280px]"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                  ৩টি হরাইজন্টাল লাইনে এক চিহ্ন মিললে অথবা যেকোনো ডায়াগোনাল ম্যাচিং হলেই পাবেন বাম্পার পুরস্কার!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Betting Controller Panel */}
        <div className="p-5 bg-[#1a2027] border-t border-[#2d3844] space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium font-sans">বেটের পরিমাণ কারেন্সি (BDT ৳):</span>
              <span className="text-[#f1b80d] font-bold">৳{bet.toLocaleString()} BDT</span>
            </div>
            
            {/* Quick bets list */}
            <div className="grid grid-cols-5 gap-1.5 overflow-x-auto">
              {currentBetOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    playBeep(330, 0.05, 'sine');
                    setBet(amount);
                  }}
                  disabled={isSpinning}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    bet === amount
                      ? 'border-[#00b986] bg-[#00b986] text-white'
                      : 'border-[#2d3844] bg-[#222a33] text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  ৳{amount >= 1000 ? `${(amount / 1000).toFixed(0)}K` : amount}
                </button>
              ))}
            </div>
          </div>

          {/* Large Action SPIN Button */}
          <button
            onClick={handleSpinClick}
            disabled={isSpinning}
            className="w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg cursor-pointer transform active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white disabled:from-[#2e3742] disabled:to-[#2e3742] disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isSpinning ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                ঘুরছে...
              </>
            ) : (
              <>
                <i className="fa-solid fa-dharmachakra text-xl animate-spin-slow"></i>
                বেট ধরুন ও স্পিন করুন!
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
