import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Sparkles, AlertCircle, Coins, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpinWheelModalProps {
  user: UserProfile;
  onSpinWin: (rewardAmount: number, isFree: boolean) => void;
  onClose: () => void;
}

const SECTORS = [
  { amount: 10, label: '৳ ১০', color: '#ff4d4f' },
  { amount: 50, label: '৳ ৫০', color: '#ff7a45' },
  { amount: 100, label: '৳ ১০০', color: '#ffc53d' },
  { amount: 200, label: '৳ ২০০', color: '#73d13d' },
  { amount: 500, label: '৳ ৫০০', color: '#40a9ff' },
  { amount: 1000, label: '৳ ১,০০০ ✨', color: '#9254de' },
  { amount: 20, label: '৳ ২০', color: '#f759ab' },
  { amount: 5, label: '৳ ৫', color: '#595959' },
];

export default function SpinWheelModal({ user, onSpinWin, onClose }: SpinWheelModalProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);

  const startSpin = () => {
    if (isSpinning) return;
    const isFree = user.spinsCount > 0;
    
    if (!isFree && user.balance < 100) {
      alert('স্পিন করতে আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই (মুল্য ১০০ টাকা) অথবা স্পিন কুপনও নেই!');
      return;
    }

    setIsSpinning(true);
    setPrizeIndex(null);

    // Probabilistic selection
    const rand = Math.random() * 100;
    let selectedIdx = 7; // default 5 BDT
    if (rand < 50) {
      // ৳10 or ৳20
      selectedIdx = Math.random() < 0.6 ? 0 : 6;
    } else if (rand < 75) {
      // ৳50
      selectedIdx = 1;
    } else if (rand < 90) {
      // ৳100
      selectedIdx = 2;
    } else if (rand < 97) {
      // ৳200
      selectedIdx = 3;
    } else if (rand < 99.5) {
      // ৳500
      selectedIdx = 4;
    } else {
      // ৳1,000 jackpot!
      selectedIdx = 5;
    }

    // Rotations formula: Full rot (e.g. 5 times * 360) + target degree matching sector center
    const sectorDegree = 360 / SECTORS.length;
    // index is clockwise. The needle counts top center. So target is - (index * degree)
    // Add offset for precise aesthetic matching
    const targetDegree = 360 * 6 - (selectedIdx * sectorDegree) - (sectorDegree / 2);

    setRotationDegrees(targetDegree);

    // Simulated retro wheel beeps sound using Synth Audio Context
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        let beepCount = 0;
        const interval = setInterval(() => {
          if (beepCount > 15) {
            clearInterval(interval);
            return;
          }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 600 - beepCount * 25;
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
          beepCount++;
        }, 150);
      }
    } catch (e) { }

    setTimeout(() => {
      setIsSpinning(false);
      setPrizeIndex(selectedIdx);
      onSpinWin(SECTORS[selectedIdx].amount, isFree);

      // Play success fanfare chime
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 523.25; // C5
            gain.connect(ctx.destination);
            osc.connect(gain);
            osc.start(); osc.stop(ctx.currentTime + 0.25);
          }, 0);
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 659.25; // E5
            gain.connect(ctx.destination);
            osc.connect(gain);
            osc.start(); osc.stop(ctx.currentTime + 0.25);
          }, 150);
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 783.99; // G5
            gain.connect(ctx.destination);
            osc.connect(gain);
            osc.start(); osc.stop(ctx.currentTime + 0.5);
          }, 300);
        }
      } catch (e) { }

    }, 3800);
  };

  const isFreeSpin = user.spinsCount > 0;

  return (
    <div className="fixed inset-0 bg-black/85 z-[2100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#1e2424] border border-[#2d3a3a] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer bg-[#293232] p-1.5 rounded-full transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl font-extrabold text-[#f1b80d] flex items-center justify-center gap-1.5 uppercase font-sans">
            <Award className="w-5 h-5 text-yellow-400" /> লাকি প্রাইজ স্পিন চাকা
          </h3>
          <p className="text-xs text-gray-400">প্রতিদিন পান ফ্রি মেগা বোনাস বা বেট কুপন টাকা</p>
        </div>

        {/* Dynamic spinning wheel container */}
        <div className="relative w-72 h-72 mx-auto my-4 flex items-center justify-center">
          
          {/* Top Indicator pointer */}
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-400 z-30 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-pulse" />

          {/* Sliced Circle Container */}
          <div
            className="w-full h-full rounded-full border-8 border-[#2e3b3b] shadow-2xl relative overflow-hidden transition-transform duration-[3.8s] ease-out-quint"
            style={{
              transform: `rotate(${rotationDegrees}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.1, 0.8, 0.1, 1)',
              background: '#111515',
            }}
          >
            {SECTORS.map((sector, idx) => {
              const deg = 360 / SECTORS.length;
              const rot = idx * deg;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full origin-center flex justify-center items-[flex-start] overflow-hidden"
                  style={{
                    transform: `rotate(${rot}deg)`,
                    clipPath: 'polygon(50% 50%, 30.5% 0, 69.5% 0)',
                  }}
                >
                  {/* Color slice */}
                  <div
                    className="absolute inset-0 opacity-[0.82]"
                    style={{ backgroundColor: sector.color }}
                  />
                  {/* Label placement Rotate */}
                  <span
                    className="relative text-black font-extrabold text-[13px] tracking-wide pt-7 select-none text-center block"
                    style={{
                      transform: 'rotate(0deg)',
                      textShadow: '0px 1px 1.5px rgba(255,255,255,0.7)',
                    }}
                  >
                    {sector.label}
                  </span>
                </div>
              );
            })}

            {/* Inner aesthetic center pin cap */}
            <div className="absolute inset-[38%] bg-[#222929] rounded-full border-4 border-yellow-400 z-10 flex items-center justify-center shadow-inner">
              <div className="text-yellow-400 text-xs font-bold font-sans tracking-wide">
                ৳ WIN
              </div>
            </div>
          </div>
        </div>

        {/* Feedback box */}
        <div className="h-14 flex items-center justify-center text-center my-2">
          <AnimatePresence mode="wait">
            {isSpinning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#00ffcc] font-bold text-xs animate-bounce"
              >
                চাকাটি ঘুরছে... আপনার জিল মিলবে কি?
              </motion.div>
            ) : prizeIndex !== null ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-400 w-full"
              >
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                  <Coins className="w-4 h-4 text-yellow-400 animate-spin" />
                  অসাধারণ! আপনি জিতেছেন: ৳{SECTORS[prizeIndex].amount} টাকা!
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-xs flex justify-center items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                {isFreeSpin
                  ? 'আপনার রয়েছে ১ টি বিনামূল্যে লাকি স্পিন সুযোগ!'
                  : 'ফ্রি সুযোগ শেষ। প্রতি স্পিনে খরচ হবে ৳ ১০০ টাকা মূল ব্যালেন্স।'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spin trigger buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={startSpin}
            disabled={isSpinning}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-550 to-yellow-600 bg-yellow-500 text-black font-extrabold text-base tracking-wide rounded-xl cursor-pointer shadow-lg transform active:scale-95 transition-all text-center flex justify-center items-center gap-2 "
          >
            <i className="fa-solid fa-dharmachakra text-lg animate-spin-slow" />
            {isSpinning ? 'অপেক্ষা করুন...' : isFreeSpin ? 'ফ্রি স্পিন করুন' : '৳১০০ কেটে স্পিন করুন'}
          </button>
          
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="w-full py-2 bg-transparent text-gray-500 hover:text-white cursor-pointer text-xs font-semibold text-center transition-all focus:outline-none"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
}
