import React, { useState } from 'react';
import { UserProfile, Transaction, BetRecord } from '../types';
import { motion } from 'motion/react';
import {
  User,
  Wallet,
  Shield,
  Activity,
  Award,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  History,
  Lock,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  X
} from 'lucide-react';

interface AccountTrackerPageProps {
  user: UserProfile | null;
  transactions: Transaction[];
  betHistory: BetRecord[];
  onBack: () => void;
  onNavigateToTab: (tab: 'home' | 'deposit' | 'invite' | 'promotion' | 'profile') => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  jackpotPool: number;
}

export default function AccountTrackerPage({
  user,
  transactions,
  betHistory,
  onBack,
  onNavigateToTab,
  onOpenAuth,
  jackpotPool
}: AccountTrackerPageProps) {
  
  const [activePolicyTab, setActivePolicyTab] = useState<'rules' | 'deposit' | 'withdraw' | 'security'>('rules');

  // Calculate handy aggregate states if user is present
  const totalReceivedRewards = transactions
    .filter(t => t.type === 'reward' || t.type === 'spin_win')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto text-slate-200 p-4 md:p-6 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-450 hover:text-white hover:bg-rose-600/10 transition-all cursor-pointer bg-slate-900 border border-slate-800 hover:border-rose-500/30 px-3.5 py-1.5 rounded-xl text-rose-400"
        >
          <X className="w-4 h-4 text-rose-500" /> বন্ধ করুন
        </button>
        <span className="text-xs bg-[#00b986]/10 text-[#00b986] border border-[#00b986]/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">
          লাইভ অ্যাকাউন্ট ট্র্যাকার
        </span>
      </div>

      {/* RENDER UNAUTHENTICATED OR AUTHENTICATED */}
      {!user ? (
        <div className="bg-[#1E293B] border border-slate-700/80 p-8 md:p-12 text-center rounded-3xl max-w-md mx-auto space-y-5 shadow-2xl relative overflow-hidden my-8">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-yellow-500 to-amber-500" />
          <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-3xl flex items-center justify-center rounded-2xl mx-auto shadow-inner animate-pulse">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-black text-lg text-yellow-500">আপনার অ্যাকাউন্ট ট্র্যাকার দেখতে লগইন করুন</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans px-5 font-semibold">
              আপনার লাইভ কারেন্সি ব্যালেন্স, ডিপোজিট কুইক ট্র্যাকিং তথ্য এবং ভিআইপি র্যাঙ্ক আপডেট করতে নিবন্ধন বা লগইন করুন।
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98] text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase"
            >
              আজকেই লগইন করুন
            </button>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-[11px] text-slate-500 font-bold">নতুন ব্যবহারকারী?</span>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-[11px] text-yellow-500 font-extrabold hover:underline cursor-pointer"
              >
                ফ্রি অ্যাকাউন্ট খুলুন
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 1-COL: DETAILED MAIN PROFILE PROFILE METRIC BOX */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b986]/3 opacity-[0.03] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00b986] to-[#04d69c] flex items-center justify-center text-white text-xl font-bold shadow-md shadow-emerald-950/20">
                  👤
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-50 font-sans tracking-wide">{user.username}</h3>
                    {user.isGuest && (
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded px-1.5 font-bold font-sans uppercase">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">
                    UID: {user.uid.slice(0, 10).toUpperCase()}...
                  </p>
                </div>
              </div>

              {/* WALLET BALANCE METRIC DISPLAY */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase flex items-center gap-1.5 font-sans">
                    <Wallet className="w-3.5 h-3.5 text-[#00b986]" /> বিডিটি কারেন্সি ব্যালেন্স
                  </span>
                  <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 px-2 py-0.25 rounded font-black tracking-wide uppercase font-mono">
                    Active BDT
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black text-yellow-500 tracking-tight font-sans">
                    ৳ {user.balance.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">
                    Bangladesh Taka
                  </span>
                </div>
              </div>

              {/* COMPREHENSIVE DETAIL ROWS COPIED FROM SCREENSHOT CONCEPT WITH METRICS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-yellow-500" /> ভিআইপি র্যাঙ্ক লেভেল:
                  </span>
                  <span className="font-extrabold text-[#F8FAFC] tracking-wide font-sans">
                    VIP TIER {user.vipLevel || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> মোট আমানত পরিমাণ:
                  </span>
                  <span className="font-bold text-emerald-400 font-sans">
                    ৳ {(user.totalDeposits || 0).toLocaleString()} BDT
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" /> মোট বেটের সংখ্যা:
                  </span>
                  <span className="font-bold text-slate-300 font-mono">
                    {(user.totalBets || 0).toLocaleString()} বার
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#00b986]" /> অর্জন করা ক্লেইম বোনাস:
                  </span>
                  <span className="font-bold text-yellow-500 font-sans">
                    ৳ {totalReceivedRewards.toLocaleString()} BDT
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" /> মেম্বারশিপ রেজিস্ট্রেশন:
                  </span>
                  <span className="font-semibold text-slate-300 font-sans text-[11px]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'বর্তমানে সক্রিয়'}
                  </span>
                </div>
              </div>

              {/* REDIRECT QUICK SHORTCUTS COMPONENT */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onNavigateToTab('deposit')}
                  className="py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3.5 h-3.5 stroke-[2.2]" /> সরাসরি ডিপোজিট
                </button>
                <button
                  onClick={() => onNavigateToTab('profile')}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <User className="w-3.5 h-3.5" /> প্রোফাইল ভিউ
                </button>
              </div>

            </div>

            {/* LIVE SYSTEM JACKPOT STATUS */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-4.5 space-y-2 text-sans flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block">
                  লাইভ গ্লোবাল জ্যাকপট পুল
                </span>
                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 font-sans">
                  ৳ {jackpotPool.toLocaleString()} BDT
                </span>
              </div>
              <div className="text-3xl animate-bounce">👑</div>
            </div>

          </div>

          {/* RIGHT 2-COLS: TRANSACTION HISTORY LOGS AND RECENT BETS AT A GLANCE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. TRANSACTION LOGS CONTAINER BOARD */}
            <div className="bg-slate-900 border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm text-slate-50 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#00b986]" /> সাম্প্রতিক রিভোর্ড ও লেনদেনসমূহ
                </h4>
                {pendingDeposits > 0 && (
                  <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full px-2 py-0.5 font-bold animate-pulse">
                    ৳ {pendingDeposits.toLocaleString()} পেন্ডিং রয়েছে
                  </span>
                )}
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 space-y-2 bg-[#0b0f19]/30 border border-slate-850 rounded-xl">
                  <span className="text-3xl text-slate-600 block">📊</span>
                  <p className="text-xs text-slate-400 font-bold font-sans">কোনো উইথড্র বা ডিপোজিট পাওয়া যায়নি।</p>
                  <p className="text-[10px] text-slate-500">আপনার প্রথম ডিপোজিট সম্পন্ন করতে নিচের লিঙ্কে ভিজিট করুন।</p>
                  <button
                    onClick={() => onNavigateToTab('deposit')}
                    className="py-1 px-4 mt-2 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all"
                  >
                    ডিপোজিট করুন এখন
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {transactions.slice(0, 5).map((txn) => {
                    const isSuccess = txn.status === 'success';
                    const isPending = txn.status === 'pending';
                    const isDepositType = txn.type === 'deposit';
                    return (
                      <div
                        key={txn.id}
                        className="bg-[#0b0f19]/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between hover:bg-slate-950/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isDepositType ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isDepositType ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-200 uppercase tracking-tighter">
                              {txn.description}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-sans mt-0.5">
                              <span>{txn.paymentMethod ? txn.paymentMethod.toUpperCase() : 'WALLET'}</span>
                              <span>•</span>
                              <span className="font-mono text-[9px]">{new Date(txn.createdAt).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className={`text-xs font-black font-sans block ${
                            isDepositType ? 'text-emerald-400' : 'text-yellow-500'
                          }`}>
                            {isDepositType ? '+' : '-'} ৳{txn.amount.toLocaleString()}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.25 rounded-md font-sans border inline-block ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isPending
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border-transparent'
                          }`}>
                            {isSuccess ? 'সফল' : isPending ? 'পেন্ডিং' : 'ব্যর্থ'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. CASINO GAMING RULES & PAYMENT POLICY */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl select-none">
              <div className="space-y-1.5 animate-fade-in">
                <h3 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wide flex items-center gap-2">
                  🎰 Casino Gaming Rules & Payment Policy
                </h3>
                <p className="text-[11px] text-slate-400 font-medium font-sans leading-relaxed">
                  স্বাগতম আমাদের Gaming Platform-এ। নিরাপদ, দ্রুত এবং স্বচ্ছ সেবা নিশ্চিত করার জন্য নিচের নিয়মাবলী মনোযোগ সহকারে পড়ুন।
                </p>
              </div>

              {/* Policy Category Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-[#0b0f19]/80 p-1.5 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActivePolicyTab('rules')}
                  className={`text-[10px] py-2 px-1 rounded-lg font-black tracking-tight transition-all cursor-pointer ${
                    activePolicyTab === 'rules'
                      ? 'bg-yellow-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  🎮 গেম নিয়ম
                </button>
                <button
                  type="button"
                  onClick={() => setActivePolicyTab('deposit')}
                  className={`text-[10px] py-2 px-1 rounded-lg font-black tracking-tight transition-all cursor-pointer ${
                    activePolicyTab === 'deposit'
                      ? 'bg-yellow-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  💳 Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setActivePolicyTab('withdraw')}
                  className={`text-[10px] py-2 px-1 rounded-lg font-black tracking-tight transition-all cursor-pointer ${
                    activePolicyTab === 'withdraw'
                      ? 'bg-yellow-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  💸 Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setActivePolicyTab('security')}
                  className={`text-[10px] py-2 px-1 rounded-lg font-black tracking-tight transition-all cursor-pointer ${
                    activePolicyTab === 'security'
                      ? 'bg-yellow-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  🔒 নিরাপত্তা
                </button>
              </div>

              {/* Content Panel */}
              <div className="bg-[#0b0f19]/45 border border-slate-850 rounded-xl p-4 min-h-[190px] font-sans">
                {activePolicyTab === 'rules' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                      🎮 গেম খেলার নিয়ম
                    </h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed font-semibold">
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">১.</span>
                        <span>সকল গেম Random Gaming System (RNG) এর মাধ্যমে পরিচালিত হয়।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">২.</span>
                        <span>প্রতিটি বেট সম্পূর্ণভাবে ব্যবহারকারীর নিজস্ব সিদ্ধান্তে করা হয়।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৩.</span>
                        <span>গেমে জয় বা পরাজয় সম্পূর্ণ ভাগ্য ও সিস্টেম রেজাল্টের উপর নির্ভরশীল।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৪.</span>
                        <span>একই সময়ে একাধিক ডিভাইস বা একাধিক অ্যাকাউন্ট ব্যবহার করা নিষিদ্ধ।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৫.</span>
                        <span>সিস্টেমে কোনো ধরনের বাগ, স্ক্রিপ্ট, অটো টুল বা অবৈধ সফটওয়্যার ব্যবহার করলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করা হতে পারে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৬.</span>
                        <span>Admin Panel কর্তৃপক্ষ যেকোনো সন্দেহজনক কার্যক্রম তদন্ত করার অধিকার সংরক্ষণ করে।</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activePolicyTab === 'deposit' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                      💳 Deposit Policy
                    </h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed font-semibold">
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">১.</span>
                        <span>Deposit করার পূর্বে সঠিক Payment Method নির্বাচন করুন।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">২.</span>
                        <span>শুধুমাত্র অফিসিয়াল নাম্বার/মার্চেন্টে পেমেন্ট সম্পন্ন করুন।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৩.</span>
                        <span>টাকা পাঠানোর পর অবশ্যই সঠিক Transaction ID (TrxID) সাবমিট করতে হবে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৪.</span>
                        <span>ভুল বা ভুয়া Transaction ID প্রদান করলে Deposit বাতিল হতে পারে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৫.</span>
                        <span>সাধারণত সফল Deposit ১–৫ মিনিটের মধ্যে ব্যালেন্সে যোগ হয়।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৬.</span>
                        <span>Network Delay বা Payment Gateway সমস্যার কারণে কিছু ক্ষেত্রে অতিরিক্ত সময় লাগতে পারে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৭.</span>
                        <span>Bonus বা Promotional Balance সরাসরি Withdraw করা যাবে না, নির্ধারিত Turnover সম্পন্ন করতে হবে।</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activePolicyTab === 'withdraw' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                      💸 Withdrawal Policy
                    </h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed font-semibold">
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">১.</span>
                        <span>Withdraw Request দেওয়ার আগে Account Information সঠিকভাবে যুক্ত করুন।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">২.</span>
                        <span>Withdraw শুধুমাত্র Registered Payment Account-এ পাঠানো হবে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৩.</span>
                        <span>Minimum Withdraw Limit এবং Maximum Daily Limit সিস্টেম অনুযায়ী প্রযোজ্য হবে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৪.</span>
                        <span>Pending Bet বা Bonus Turnover অসম্পূর্ণ থাকলে Withdraw Request বাতিল হতে পারে।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৫.</span>
                        <span>সাধারণত Withdraw Process ৫ মিনিট থেকে ২৪ ঘণ্টার মধ্যে সম্পন্ন হয়।</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 shrink-0 font-bold">৬.</span>
                        <span>Fraud, Money Laundering বা সন্দেহজনক ট্রানজেকশন শনাক্ত হলে Withdraw সাময়িকভাবে স্থগিত করা হতে পারে।</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activePolicyTab === 'security' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-200 border-b border-slate-850 pb-1.5">
                        🔒 Account Security Policy
                      </h4>
                      <ul className="space-y-1.5 text-[10.5px] text-slate-400 leading-relaxed font-semibold">
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>নিজের Account Password ও OTP কারও সাথে শেয়ার করবেন না।</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>ব্যবহারকারীর অবহেলাজনিত কারণে Account Access হারালে authority দায়ী থাকবে না।</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>Fake Account, Multiple ID বা Bonus Abuse শনাক্ত হলে Account Suspend করা হবে।</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>Security Verification এর জন্য প্রয়োজনে অতিরিক্ত তথ্য চাওয়া হতে পারে।</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2 border-t border-slate-850 pt-2.5">
                      <h4 className="text-xs font-extrabold text-slate-200 pb-1.5 flex items-center gap-1">
                        ⚠️ Terms & Conditions
                      </h4>
                      <ul className="space-y-1.5 text-[10.5px] text-slate-400 leading-relaxed font-semibold">
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>Platform ব্যবহার করার মাধ্যমে আপনি সকল Rules & Policies মেনে নিচ্ছেন।</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>কর্তৃপক্ষ প্রয়োজনে যেকোনো সময় নিয়ম পরিবর্তন, আপডেট বা সংশোধন করার অধিকার রাখে।</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>Technical Error, Server Issue বা Unexpected System Problem এর ক্ষেত্রে Admin Decision চূড়ান্ত বলে গণ্য হবে।</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-500 shrink-0 font-bold">•</span>
                          <span>দায়িত্বশীলভাবে গেম খেলুন এবং নিজের আর্থিক সীমার মধ্যে থাকুন।</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure bottom layout note */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
                <span className="font-bold text-[#00b986] flex items-center gap-1">
                  ✓ নিরাপদ | ✓ দ্রুত | ✓ স্বচ্ছ Gaming Experience আমাদের লক্ষ্য
                </span>
                <span className="bg-[#00b986]/10 text-[#00b986] border border-[#00b986]/20 px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider">
                  CRBET SECURE PORTAL
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
