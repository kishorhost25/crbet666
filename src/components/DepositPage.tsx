import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Info,
  MessageCircle,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Gift,
  ArrowRight
} from 'lucide-react';

interface DepositPageProps {
  user: UserProfile;
  onDeposit: (amount: number, method: 'bkash' | 'nagad' | 'rocket', accountNo: string, txnId: string) => void;
  onBack: () => void;
  onNavigateToTab: (tabName: 'home' | 'deposit' | 'invite' | 'profile' | 'promotion') => void;
}

export default function DepositPage({
  user,
  onDeposit,
  onBack,
  onNavigateToTab
}: DepositPageProps) {
  // Methods & Options state
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [channel, setChannel] = useState<'SU77PAY' | 'VCPAY'>('SU77PAY');
  const [amount, setAmount] = useState<string>('500');
  
  // Form submission states
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [txnId, setTxnId] = useState<string>('');
  const [activeBonus, setActiveBonus] = useState<'promo50' | 'rebate1'>('rebate1');

  // Static list of quick deposit amounts
  const quickAmounts = ['100', '300', '500', '1000', '3000', '5000', '10000', '20000', '25000'];

  // Modal stats for quick explanations
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    
    if (!senderPhone || senderPhone.trim().length < 10) {
      alert('অনুগ্রহ করে সঠিক পাঠানো মোবাইল নম্বরটি প্রদান করুন (কমপক্ষে ১০ সংখ্যা)!');
      return;
    }
    
    if (!txnId || txnId.trim().length < 8) {
      alert('অনুগ্রহ করে সঠিক ৮-১০ সংখ্যার ট্রানজেকশন আইডি (TxID) প্রদান করুন!');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount < 100) {
      alert('সর্বনিম্ন ডিপোজিট পরিমাণ ১০০ টাকা!');
      return;
    }

    if (parsedAmount > 30000) {
      alert('সর্বোচ্চ এককালীন ডিপোজিট সীমা ৩০,০০০ টাকা!');
      return;
    }

    // Call callback handler provided from parents
    onDeposit(parsedAmount, method === 'bkash' ? 'bkash' : 'nagad', senderPhone, txnId);
    
    // Success feedback
    alert(`ধন্যবাদ! আপনার ৳${parsedAmount} টাকার সফল ডিপোজিট আবেদন জমা হয়েছে।\nআমাদের টিম ট্রানজেকশন আইডি: "${txnId.toUpperCase()}" ভেরিফাই করে ১-২ মিনিটের মধ্যে মূল ওয়ালেটে টাকা যুক্ত করে দেবে।`);
    
    // Clear state
    setSenderPhone('');
    setTxnId('');
    onBack();
  };

  return (
    <div id="deposit-full-page" className="w-full max-w-md mx-auto bg-[#181d26] text-[#F8FAFC] min-h-[92vh] flex flex-col font-sans relative overflow-hidden rounded-3xl shadow-2xl border border-slate-800">
      
      {/* 1. COMPACT DARK HEADER FOR DIRECT PORTAL */}
      <header className="px-4 py-4 flex items-center justify-between bg-[#13171e] border-b border-slate-900/60 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-slate-300 hover:text-white cursor-pointer select-none transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400 stroke-[3]" /> ফিরে
        </button>
        
        <h1 className="text-base font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-200 uppercase">
          আমানত
        </h1>

        {/* Action icons row on header matching image */}
        <div className="flex items-center gap-3 text-slate-400">
          <button
            onClick={() => setInfoModal({
              isOpen: true,
              title: 'লেনদেনের বিবরণ নির্দেশিকা',
              content: 'আপনার প্রতিটি আমানত ও উত্তোলন অনুরোধ এই সিস্টেমে রিয়েল-টাইম প্রসেস করা হয়। কোনো ত্রুটি হলে সঠিক ট্রানজেকশন আইডি সহ কাস্টমার সাপোর্টে যোগাযোগ করুন।'
            })}
            title="লেনদেন বিবরণ"
            className="hover:text-yellow-500 cursor-pointer transition-colors"
          >
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </button>
          <button
            onClick={() => setInfoModal({
              isOpen: true,
              title: 'ডিপোজিট হেল্প সেন্টার',
              content: 'বিকাশ অথবা নগদ ব্যবহার করে সহজে ওয়ালেটে টাকা লোড করুন। নিচে দেওয়া ওয়ালেট নম্বরে সেন্ডমানি করার পর সঠিকভাবে TxnID সাবমিট করলেই টাকা স্বয়ংক্রিয়ভাবে ক্রেডিট হবে।'
            })}
            title="তথ্য"
            className="hover:text-yellow-500 cursor-pointer transition-colors"
          >
            <Info className="w-5 h-5 stroke-[2.2]" />
          </button>
          <button
            onClick={() => setInfoModal({
              isOpen: true,
              title: '২৪/৭ গ্রাহক সেবা',
              content: 'যেকোনো ডিপোজিট বা উইথড্র সংক্রান্ত অনুসন্ধানে আমাদের ইন-অ্যাপ কাস্টমার সাপোর্ট চ্যাটে মেসেজ দিন। আমাদের অভিজ্ঞ অপারেটররা ১ মিনিটে সমস্যার সমাধান দেবেন।'
            })}
            title="লাইভ চ্যাট"
            className="hover:text-yellow-500 cursor-pointer transition-colors"
          >
            <MessageCircle className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER WITH CURVED CORNERS IN WHITE/OFF-WHITE */}
      <main className="flex-1 bg-[#f4f7f6] text-slate-800 rounded-t-[2.2rem] flex flex-col overflow-y-auto pb-8">
        
        {/* Upper method info selection */}
        <div className="px-5 pt-5 flex items-center justify-between pb-3 shrink-0">
          <span className="text-[11px] font-black tracking-wide text-slate-500 uppercase">
            সমস্ত পদ্ধতি
          </span>
          <button
            type="button"
            onClick={() => setInfoModal({
              isOpen: true,
              title: 'কিভাবে ডিপোজিট করা যাবে?',
              content: '১. প্রথমে বিকাশ বা নগদ গেটওয়ে চয়ন করুন।\n২. নিচে প্রদর্শিত অফিশিয়াল এজেন্ট নাম্বারে সরাসরি টাকা সেন্ড মানি করুন।\n৩. টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (TxnID) এবং আপনার মোবাইল নম্বরটি ফর্মটিতে কপি-পেস্ট করে সাবমিট করুন।'
            })}
            className="text-[11px] font-extrabold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> কিভাবে ডিপোজিট করা যাবে
          </button>
        </div>

        {/* METHOD SELECTION BRAND GRID */}
        <div className="px-5 grid grid-cols-2 gap-3 shrink-0">
          
          {/* bKash Card Option */}
          <button
            type="button"
            onClick={() => setMethod('bkash')}
            className={`relative rounded-2xl h-[76px] flex flex-col items-center justify-center p-3 select-none cursor-pointer transition-all border ${
              method === 'bkash'
                ? 'bg-[#008f75] text-[#FFFFFF] border-[#007a64] shadow-md shadow-emerald-800/10 scale-[1.02]'
                : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'
            }`}
          >
            {/* Orange Hot Badge top-left */}
            <div className="absolute -top-1 -left-1 bg-gradient-to-r from-amber-500 to-orange-600 outline outline-2 outline-white rounded-full px-1.5 py-0.25 text-[8px] text-white font-black uppercase tracking-tighter flex items-center gap-0.5 shadow-sm">
              ★ HOT
            </div>
            
            {/* bKash Custom visual mimic logo */}
            <div className={`text-base font-black tracking-tight ${method === 'bkash' ? 'text-white' : 'text-emerald-700'}`}>
              bKash
            </div>
            <div className={`text-[10px] font-bold ${method === 'bkash' ? 'text-emerald-100/95' : 'text-slate-400'} mt-1`}>
              বিকাশ পেমেন্ট
            </div>
          </button>

          {/* Nagad Card Option */}
          <button
            type="button"
            onClick={() => setMethod('nagad')}
            className={`relative rounded-2xl h-[76px] flex flex-col items-center justify-center p-3 select-none cursor-pointer transition-all border ${
              method === 'nagad'
                ? 'bg-[#e05424] text-[#FFFFFF] border-[#d8400f] shadow-md shadow-orange-950/10 scale-[1.02]'
                : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'
            }`}
          >
            {/* Orange Hot Badge top-left */}
            <div className="absolute -top-1 -left-1 bg-gradient-to-r from-amber-500 to-orange-600 outline outline-2 outline-white rounded-full px-1.5 py-0.25 text-[8px] text-white font-black uppercase tracking-tighter flex items-center gap-0.5 shadow-sm">
              ★ HOT
            </div>

            {/* Nagad custom mock logo */}
            <div className={`text-base font-black tracking-tight ${method === 'nagad' ? 'text-white' : 'text-orange-650 text-orange-600'}`}>
              Nagad
            </div>
            <div className={`text-[10px] font-bold ${method === 'nagad' ? 'text-orange-100/95' : 'text-slate-400'} mt-1`}>
              নগদ পেমেন্ট
            </div>
          </button>
        </div>

        {/* WARNING STATEMENT - ORANGE HIGHLIGHT BOX FROM SCREENSHOT */}
        <div className="mx-5 mt-4 px-4 py-3 bg-[#fff1e6] border border-[#ffb27a] text-[#d64a00] rounded-xl text-[11px] font-black text-center leading-relaxed shrink-0 shadow-sm flex items-center justify-center gap-1.5">
          <span className="text-sm">⚠️</span> আপনাকে TRXID পূরণ করতে হবে, না হলে জমা ক্রেডিট হবে না।
        </div>

        {/* PROMOTION GRADIENT BANNER MATCHING SCREENSHOT */}
        <div className="mx-5 mt-4 p-4 bg-gradient-to-r from-[#4d3ef7] to-[#7363f5] rounded-2xl text-white shadow-md shadow-indigo-900/10 flex items-center justify-between shrink-0 relative overflow-hidden">
          {/* Subtle gold coins visualization mockup on left edge */}
          <div className="absolute -right-3 -bottom-3 opacity-20 text-7xl select-none">🪙</div>
          
          <div className="flex items-center gap-3 relative z-10">
            <span className="text-3xl select-none">🪙</span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black tracking-wide text-indigo-100 uppercase">
                ব্যবহারকারীকে আমন্ত্রণ জানান,
              </h4>
              <p className="text-sm font-black text-yellow-300">
                ১% ডিপোজিট রিবেট, ৪৪,৪৪৪ টাকা পর্যন্ত
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-200 stroke-[3] hover:text-white transition-colors relative z-10 shrink-0" />
        </div>

        {/* DEPOSIT CHANNELS SELECTION ROWS */}
        <div className="px-5 pt-5 pb-2 shrink-0">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            আমানত চ্যানেল
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            
            {/* SU77PAY Channel Card */}
            <button
              type="button"
              onClick={() => setChannel('SU77PAY')}
              className={`relative rounded-xl p-3.5 flex items-center justify-between cursor-pointer select-none border transition-all ${
                channel === 'SU77PAY'
                  ? 'bg-[#008f75] border-[#007a64] text-white shadow'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {/* Hot badge */}
              <span className="absolute -top-1 -left-1 bg-orange-500 text-[7px] text-white font-black px-1 py-0.25 rounded-md uppercase">
                ★
              </span>
              <span className="text-xs font-black tracking-wide">SU77PAY</span>
              
              {/* Checkmark inside a small circle */}
              <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center ${channel === 'SU77PAY' ? 'bg-white text-emerald-800' : 'border border-slate-300'}`}>
                {channel === 'SU77PAY' && <span className="text-[10px] font-black">✓</span>}
              </div>
            </button>

            {/* VCPAY Channel Card */}
            <button
              type="button"
              onClick={() => setChannel('VCPAY')}
              className={`relative rounded-xl p-3.5 flex items-center justify-between cursor-pointer select-none border transition-all ${
                channel === 'VCPAY'
                  ? 'bg-[#008f75] border-[#007a64] text-white shadow'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-1 -left-1 bg-orange-500 text-[7px] text-white font-black px-1 py-0.25 rounded-md uppercase">
                ★
              </span>
              <span className="text-xs font-black tracking-wide font-sans">VCPAY</span>

              {/* Radio bubble */}
              <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center ${channel === 'VCPAY' ? 'bg-white text-emerald-800' : 'border border-slate-300'}`}>
                {channel === 'VCPAY' && <span className="text-[10px] font-black">✓</span>}
              </div>
            </button>
          </div>
        </div>

        {/* INPUT DEPOSIT AMOUNT COMPONENT */}
        <form onSubmit={handleSubmit} className="px-5 space-y-4 flex-1">
          
          {/* Header row of the input field */}
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              এক জমার পরিমাণ
            </span>
            <span className="text-[10px] font-extrabold text-[#008f75]">
              থেকে : BDT 100 থেকে : BDT 30,000
            </span>
          </div>

          {/* Main big numeric amount display field */}
          <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden p-1">
            <div className="flex items-center">
              <span className="pl-4 pr-2 text-xl font-black text-slate-400 select-none">
                ৳
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                max="30000"
                step="1"
                placeholder="পরিমাণ লিখুন"
                className="w-full bg-transparent text-xl font-black tracking-tight text-slate-800 py-3 px-1 outline-none font-sans"
                required
              />
            </div>
          </div>

          {/* 9-GRID DEPOSIT BUTTONS FROM SCREENSHOT */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2 rounded-xl text-xs font-black tracking-normal transition-all border ${
                  amount === val
                    ? 'border-[#008f75] bg-[#eefaf7] text-[#008f75] shadow-sm font-extrabold'
                    : 'border-slate-200 bg-white text-slate-705 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ৳{parseInt(val).toLocaleString()}
              </button>
            ))}
          </div>

          {/* MOBILE AGENT NUMBER ASSIGNMENT - DYNAMIC ON THE METHOD CHOSEN */}
          <div className="bg-[#eef3f6] border border-slate-200/80 p-3.5 rounded-2xl space-y-2">
            <div className="text-[10px] text-slate-500 font-extrabold tracking-wide uppercase flex items-center justify-between">
              <span>অফিশিয়াল রিসিপিয়েন্ট এজেন্ট নম্বর</span>
              <span className="text-[9px] bg-red-500/10 text-red-600 font-extrabold px-1.5 py-0.5 rounded border border-red-500/10">লাইভ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-800 tracking-wider font-mono select-all">
                {method === 'bkash' ? '01766554433' : '01999887766'}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(method === 'bkash' ? '01766554433' : '01999887766');
                  alert('নম্বরটি সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!');
                }}
                className="text-[10px] font-black text-blue-600 hover:underline px-2.5 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
              >
                কপি করুন
              </button>
            </div>
            <p className="text-[9px] text-[#008f75] font-black leading-normal flex items-start gap-1">
              <span>ℹ</span> ওপরের নম্বরে সেন্ডমানি (Send Money) সম্পন্ন করার পর নিচের বক্সে সঠিক তথ্য দিন।
            </p>
          </div>

          {/* INPUT FORM CREDENTIALS (SENDER MOBILE & TXID) - REAL SYSTEM INPUT REQUIRED */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3.5 shadow-sm">
            <div>
              <label className="text-[10px] text-slate-500 font-extrabold uppercase mb-1.5 block">
                যে নাম্বার থেকে টাকা পাঠিয়েছেন (Sender BDT Number)
              </label>
              <input
                type="text"
                pattern="^[0][1][3-9]\d{8}$"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="যেমন: 017xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold p-3 rounded-xl focus:outline-none focus:border-[#008f75] text-slate-800 font-sans"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-extrabold uppercase mb-1.5 block">
                ৮ সংখ্যার ট্রানজেকশন আইডি (bKash/Nagad TxId)
              </label>
              <input
                type="text"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                placeholder="যেমন: 9JH76T99X8"
                className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:outline-none focus:border-[#008f75] text-slate-800 font-mono uppercase"
                required
              />
            </div>
          </div>

          {/* 1% BONUS OR 50% FIRST DEPOSIT BONUS CHECKS */}
          <div className="py-1.5 space-y-2 select-none">
            
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50/50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="bonus-option"
                checked={activeBonus === 'promo50'}
                onChange={() => setActiveBonus('promo50')}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-[#008f75]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">কার্যকলাপ অংশগ্রহণ: প্রথম ডিপোজিটের জন্য <strong className="text-red-500">50% BDT</strong> পর্যন্ত বোনাস</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50/50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="bonus-option"
                checked={activeBonus === 'rebate1'}
                onChange={() => setActiveBonus('rebate1')}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-[#008f75]"
              />
              <div className="text-xs">
                <span className="font-extrabold text-[#008f75] block">1% প্রতিটি ডিপোজিট এক্সপ্রেস বোনাস</span>
              </div>
            </label>
          </div>

          {/* DYNAMIC VALUE MATURING SUBMIT BLUE-TEAL FLAT BUTTON AS SHOWN IN SCREENSHOT */}
          <button
            type="submit"
            className="w-full bg-[#7cc9b9] hover:bg-[#6ab3a4] active:scale-[0.99] text-white text-center font-extrabold py-4 rounded-xl transition-all shadow-md text-sm cursor-pointer select-none border border-[#71b9aa]/30 uppercase tracking-widest flex items-center justify-center gap-1.5 hover:shadow-lg"
          >
            আমানত {method === 'bkash' ? 'Bkash' : 'Nagad'}
          </button>

          {/* 3. SAFETY AND WARNING INSTRUCTION BOARD */}
          <div className="border border-red-250 border-orange-200 bg-orange-50/40 p-4.5 rounded-2xl space-y-2.5 text-[11px] leading-relaxed text-[#c05900] font-medium font-sans">
            <h5 className="font-black text-amber-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              ⚠️ গুরুত্বপূর্ণ লেনদেন শর্তাবলি:
            </h5>
            <ol className="list-decimal list-inside space-y-2 font-mono">
              <li>
                <span className="font-bold text-slate-700">১. আপনার স্থানান্তরের পরিমাণ জমা দেওয়ার পরিমাণের সাথে মেলান।</span>
              </li>
              <li>
                <span className="font-bold text-slate-700">২. প্রতিটি অর্ডার ID শুধুমাত্র একবার ব্যবহার করা যেতে পারে ডুপ্লিকেট এড়াতে।</span>
              </li>
              <li>
                <span className="font-bold text-slate-700">৩. আমানত করতে অনুগ্রহ করে আমানত নির্দেশিকা সাবধানে অনুসরণ করুন, অন্যথায় আপনার আমানত অনুপস্থিত বা ক্রেডিট হতে সমস্যা হবে।</span>
              </li>
            </ol>
          </div>

        </form>

      </main>

      {/* 4. DETAILS GUIDELINE INTERACTION MODAL POPUPS */}
      <AnimatePresence>
        {infoModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-[3000] flex items-center justify-center p-5 text-sans"
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-w-[340px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-[#008f75]" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">{infoModal.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl whitespace-pre-line">
                {infoModal.content}
              </p>
              <button
                type="button"
                onClick={() => setInfoModal({ isOpen: false, title: '', content: '' })}
                className="w-full py-2.5 bg-[#008f75] hover:bg-[#007661] text-white font-extrabold text-xs rounded-xl cursor-pointer shadow transition-all"
              >
                ঠিক আছে
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
