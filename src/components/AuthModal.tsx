import React, { useState } from 'react';
import { Sparkles, Key, Mail, UserPlus, Fingerprint, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  onAuthSuccess: (username: string, isGuest: boolean, initialDeposit?: number) => void;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ onAuthSuccess, onClose, initialTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const triggerMockSound = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = success ? 440 : 150;
        gain.connect(ctx.destination);
        osc.connect(gain);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.trim().length < 3) {
      alert('ব্যবহারকারীর নাম সর্বনিম্ন ৩ অক্ষরের হতে হবে!');
      return;
    }
    if (password.length < 4) {
      alert('পাসওয়ার্ড সর্বনিম্ন ৪ সংখ্যার হতে হবে!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      triggerMockSound(true);
      onAuthSuccess(username.trim(), false, activeTab === 'register' ? 200 : 0); // ৳200 registration gift bonus coins!
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const handleGuestPlay = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      triggerMockSound(true);
      const guestNames = ['LuckyGambler', 'SpinKing', 'JiliFan66', 'MegaAces', 'CRB_Guest', 'GoldenWin'];
      const randomName = `${guestNames[Math.floor(Math.random() * guestNames.length)]}_${Math.floor(Math.random() * 900 + 100)}`;
      onAuthSuccess(randomName, true); // Guest profile gets standard initial ৳10,000 balance credits
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[2100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-[#1E293B] border border-slate-700/80 w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl p-6 text-slate-200"
      >
        {/* Header Branding */}
        <div className="text-center space-y-1 mb-6">
          <div className="flex justify-center items-center gap-1.5">
            <span className="text-3xl font-black text-yellow-505 text-yellow-500 tracking-wider leading-none font-sans">CRBET666</span>
          </div>
          <p className="text-[10px] text-yellow-500 font-bold tracking-[2.5px] uppercase">C R B E T . C O M</p>
          <p className="text-xs text-slate-400 pt-1.5">অনলাইন ক্যাসিনো স্লট কসমিক গেমিং প্ল্যাটফর্ম</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerMockSound(true);
              setActiveTab('login');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
              activeTab === 'login' ? 'bg-yellow-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            লগইন (LOGIN)
          </button>
          <button
            type="button"
            onClick={() => {
              triggerMockSound(true);
              setActiveTab('register');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
              activeTab === 'register' ? 'bg-yellow-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            রেজিস্টার (REGISTER)
          </button>
        </div>

        {/* Auth form sheet info */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-450 text-slate-400 block font-bold mb-1 uppercase tracking-wider">মেম্বার অ্যাকাউন্ট নাম (Username):</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail className="w-4 h-4" /></span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="কমপক্ষে ৪ সংখ্যার ইংরেজি"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 font-semibold font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">পাসওয়ার্ড (Password):</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Key className="w-4 h-4" /></span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 font-semibold font-sans"
                required
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">মোবাইল ফোন নম্বর (Phone):</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="যেমন: ০১৭x-xxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2.5 px-4 text-white focus:outline-none focus:border-yellow-500 font-sans font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">আমন্ত্রণ কোড (Invite Code):</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="রেফারেল কোড (ঐচ্ছিক)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2.5 px-4 text-white focus:outline-none focus:border-yellow-500 font-sans"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-sm tracking-wide rounded-xl cursor-pointer transition-all flex justify-center items-center gap-1.5 focus:outline-none shadow-md mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin text-slate-950" />
                অপেক্ষা করুন...
              </>
            ) : activeTab === 'login' ? (
              'লগইন করুন'
            ) : (
              'নিবন্ধন করুন'
            )}
          </button>
        </form>

        {/* Separator / Guest quick login */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-800 h-[1px]" />
          <span className="bg-[#1E293B] text-[10px] text-slate-500 font-bold px-3 uppercase tracking-widest relative z-10">অথবা প্লে করুন</span>
        </div>

        <button
          onClick={handleGuestPlay}
          disabled={isSubmitting}
          className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 focus:outline-none shadow-sm"
        >
          <Fingerprint className="w-4 h-4 text-yellow-500 animate-pulse" />
          ডেমো অ্যাকাউন্ট খুলুন (৳১০,০০০ ফ্রি কয়েন)
        </button>

        {/* Gift note */}
        <div className="mt-4 flex items-center gap-1.5 justify-center text-[10.5px] text-yellow-500 font-bold text-center bg-yellow-500/5 py-1.5 rounded-lg border border-yellow-500/10">
          <Sparkles className="w-3.5 h-3.5 text-yellow-555 animate-bounce" /> নতুন মেম্বারদের জন্য রয়েছে ৳২০০ স্বাগত উপহার!
        </div>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-350 cursor-pointer pt-4 focus:outline-none font-semibold block"
        >
          বন্ধ করুন
        </button>
      </motion.div>
    </div>
  );
}
