import React, { useState } from 'react';
import { UserProfile, Transaction, BetRecord } from '../types';
import {
  Wallet,
  ArrowLeft,
  ChevronRight,
  Gift,
  Users,
  MessageSquare,
  Sparkles,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfilePanelProps {
  user: UserProfile;
  transactions: Transaction[];
  betHistory: BetRecord[];
  onDeposit: (amount: number, method: 'bkash' | 'nagad' | 'rocket', accountNo: string, txnId: string) => void;
  onWithdraw: (amount: number, method: 'bkash' | 'nagad' | 'rocket', accountNo: string) => void;
  onBack: () => void;
  onNavigateToTab: (tabName: 'home' | 'deposit' | 'invite' | 'profile' | 'spin') => void;
  onSignInClaim: () => void;
  onLogout?: () => void;
}

export default function UserProfilePanel({
  user,
  transactions,
  betHistory,
  onDeposit,
  onWithdraw,
  onBack,
  onNavigateToTab,
  onSignInClaim,
  onLogout
}: UserProfilePanelProps) {
  const [activeSubView, setActiveSubView] = useState<'main' | 'depositForm' | 'withdrawForm' | 'txHistory' | 'betHistory' | 'support'>('main');
  const [depositMethod, setDepositMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [depositPhone, setDepositPhone] = useState<string>('');
  const [depositTxNo, setDepositTxNo] = useState<string>('');

  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawPhone, setWithdrawPhone] = useState<string>('');

  // Customer support simulator states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: 'আসসালামু আলাইকুম! CRBET666 কাস্টমার সাপোর্টে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?', time: 'এখন' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!depositPhone || depositPhone.trim().length < 10) {
      alert('সঠিক পাঠান নম্বর প্রদান করুন!');
      return;
    }
    if (!depositTxNo || depositTxNo.trim().length < 8) {
      alert('৮ সংখ্যার সঠিক ট্রানজেকশন আইডি (TxnID) দিন!');
      return;
    }
    if (isNaN(amt) || amt < 100) {
      alert('সর্বনিম্ন ডিপোজিট পরিমাণ ১০০ টাকা!');
      return;
    }

    onDeposit(amt, depositMethod, depositPhone, depositTxNo);
    alert(`আপনার ৳${amt} টাকা ডিপোজিট অনুরোধটি জমা হয়েছে! আইডি ভেরিফিকেশন সাপেক্ষে ১-২ মিনিটের মধ্যে মূল ব্যালেন্স যুক্ত হবে।`);
    setDepositPhone('');
    setDepositTxNo('');
    setActiveSubView('main');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt < 500) {
      alert('সর্বনিম্ন উত্তোলন ৫০০ টাকা!');
      return;
    }
    if (user.balance < amt) {
      alert('দুঃখিত! আপনার ব্যালেন্সে পর্যাপ্ত পরিমাণ টাকা নেই।');
      return;
    }
    if (!withdrawPhone || withdrawPhone.trim().length < 10) {
      alert('সঠিক মোবাইল নম্বর প্রদান করুন!');
      return;
    }

    onWithdraw(amt, withdrawMethod, withdrawPhone);
    alert(`৳${amt} টাকা উত্তোলনের আবেদন সম্পন্ন হয়েছে। এটি আপনার সিলেক্ট করা ওয়ালেটে ৩-৪ ঘণ্টার মধ্যে পৌঁছে যাবে।`);
    setWithdrawAmount('');
    setWithdrawPhone('');
    setActiveSubView('main');
  };

  const handleSupportSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: 'এখন' }]);
    setChatInput('');
    setIsAgentTyping(true);

    // Dynamic support answers in Bengali
    setTimeout(() => {
      let replyTxt = 'ধন্যবাদ আপনার মেসেজের জন্য। অনুগ্রহ করে একটু অপেক্ষা করুন, আমাদের লাইভ টিম সদস্য আপনার তথ্যটি দেখছেন।';
      const msgLower = userMsg.toLowerCase();

      if (msgLower.includes('ডিপোজিট') || msgLower.includes('deposit') || msgLower.includes('টাকা পাঠাইছি')) {
        replyTxt = 'ওয়ালাইকুম আসসালাম! আপনি ডিপোজিট করতে bkash, Nagad বা Rocket সিলেক্ট করুন, "ডিপোজিট করুন" থেকে নম্বর দেখে টাকা সেন্ডমানি বা ক্যাশ-আউট করুন এবং ৮ সংখ্যার TxnID এবং যে নম্বর থেকে টাকা পাঠিয়েছেন তা সঠিকভাবে সাবমিট করুন। ১-৫ মিনিটে ব্যালেন্স অ্যাড হবে।';
      } else if (msgLower.includes('উত্তোলন') || msgLower.includes('withdraw') || msgLower.includes('টাকা তুলবো')) {
        replyTxt = 'স্যার, উত্তোলন করতে সদস্য প্যানেলের "উত্তোলন" অপশনে যান এবং রকেট বিকাশ নগদ নাম্বার সহ ৫০০ টাকা বা তার বেশি টাকার আবেদন সাবমিট করুন। ৩ ঘণ্টার মধ্যে পেমেন্ট ক্লিয়ার করা হয়।';
      } else if (msgLower.includes('বোনাস') || msgLower.includes('bonus') || msgLower.includes('কোড')) {
        replyTxt = 'স্যার, প্রতিদিন সাইন ইন করলে ৳১৮ পর্যন্ত দাবি করতে পারবেন। এছাড়া প্রথম ডিপোজিটে পাবেন ১৬৮ টাকা পর্যন্ত বিশেষ ওয়েলকাম বোনাস! আপনার রেফার লিংক থেকে বন্ধুদের আমন্ত্রণ জানালেও বিশেষ প্রমোশনাল কমিশন পাবেন।';
      } else if (msgLower.includes('গেম') || msgLower.includes('খেলা') || msgLower.includes('slot') || msgLower.includes('স্লট')) {
        replyTxt = 'আমাদের সাইটে ১০০০+ স্লট গেম সচল রয়েছে যেমন JILI Super Ace, Boxing King, এবং Crazy 777. আপনি আপনার পছন্দের বেট সাইজ নির্ধারণ করে "স্পিন" চাপলেই জয়ী হওয়ার দ্বিগুণ সুযোগ পাবেন!';
      } else if (msgLower.includes('হেই') || msgLower.includes('হ্যালো') || msgLower.includes('hi') || msgLower.includes('hello')) {
        replyTxt = 'হ্যালো স্যার! কেমন সাহায্য করতে পারি? ডিপোজিট, উইথড্র বা বোনাস সম্পর্কে কি আপনার কোনো প্রশ্ন আছে? আমাদের জানান আমরা দ্রুত সমাধান দিতে প্রস্তুত।';
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: replyTxt, time: 'এখন' }]);
      setIsAgentTyping(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#1E293B] border border-slate-700 rounded-3xl min-h-[85vh] p-4 text-slate-200 shadow-2xl">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer transition-all font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> পিছে যান
        </button>
        <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
          {activeSubView === 'main' ? 'সদস্য প্রোফাইল' : activeSubView === 'depositForm' ? 'আমানত জমা' : activeSubView === 'withdrawForm' ? 'উত্তোলন ফর্ম' : activeSubView === 'txHistory' ? 'লেনদেন ইতিহাস' : activeSubView === 'betHistory' ? 'বেটিং রেকর্ড' : 'সহায়তা চ্যাট'}
        </h2>
        <div className="text-xs bg-[#0F172A] px-2.5 py-1 rounded-full text-yellow-550 border border-slate-800 font-semibold flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" /> একটিভ
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* MAIN USER PANEL VIEW */}
        {activeSubView === 'main' && (
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Profile Summary Card */}
            <div className="flex items-center gap-4 bg-[#0F172A] border border-slate-800/80 p-4 rounded-2xl">
              <div className="avatar-container w-[56px] h-[56px] bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center relative shadow-lg">
                <i className="fa-solid fa-user-tie text-2xl text-slate-950"></i>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#0F172A] text-yellow-500 border border-slate-800 text-[9px] font-extrabold px-1.5 py-0.25 rounded-full select-none shadow">
                  VIP {user.vipLevel}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-[#F8FAFC] text-base font-sans flex items-center gap-1.5 leading-none">
                  {user.username} {user.isGuest && <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/10">ডেমো</span>}
                </h3>
                <span className="text-xs text-slate-400 font-mono block mt-1">ID: CRB_{user.uid.substring(0, 8)}</span>
              </div>
              <div className="text-right">
                <div className="bg-yellow-500/10 border border-yellow-550/20 px-2.5 py-1.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-semibold">সদস্য লেভেল</span>
                  <span className="text-xs text-yellow-500 font-bold font-sans">গোল্ড ৩</span>
                </div>
              </div>
            </div>

            {/* VIP Level Stats progressions */}
            <div className="bg-[#0F172A] border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-500" /> VIP {user.vipLevel} মেম্বারশিপ সুযোগসমূহ
                </span>
                <span className="text-[11px] text-slate-500">পরের লেভেল: VIP {user.vipLevel + 1}</span>
              </div>

              {/* Progress Accumulator lists */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>মোট ডিপোজিট অগ্রগতি: ৳{user.totalDeposits.toLocaleString()} / ৳৫,০০০</span>
                    <span>{Math.min(100, Math.round((user.totalDeposits / 5000) * 100))}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-905 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all" style={{ width: `${Math.min(100, (user.totalDeposits / 5000) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>মোট বেটিং টার্নওভার: ৳{user.totalBets.toLocaleString()} / ৳৫০,০০০</span>
                    <span>{Math.min(100, Math.round((user.totalBets / 50000) * 100))}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full transition-all" style={{ width: `${Math.min(100, (user.totalBets / 50000) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Real Balance card panel */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-yellow-500" /> আমার ওয়ালেট ব্যালেন্স
                </span>
                <span className="text-yellow-550 font-bold font-sans">৳ BDT কারেন্সি</span>
              </div>
              <div>
                <span className="text-3xl font-black text-white tracking-tight font-sans">৳ {user.balance.toLocaleString()}</span>
                <p className="text-xs text-yellow-450 text-yellow-500 font-medium mt-1">আজকের ক্যাশব্যাক বোনাস: +৳ {(user.totalBets * 0.012).toFixed(1)}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveSubView('withdrawForm')}
                  className="flex-1 py-3 text-center bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl cursor-pointer transition-all border border-slate-700 flex items-center justify-center gap-2 text-xs"
                >
                  উত্তোলন করুন <i className="fa-solid fa-money-bill-transfer"></i>
                </button>
                <button
                  onClick={() => onNavigateToTab('deposit')}
                  className="flex-1 py-3 text-center bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold rounded-xl cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 text-xs"
                >
                  ডিপোজিট <i className="fa-solid fa-wallet"></i>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs text-slate-400">
                <span>এক্টিভ কুপন বোনাস:</span>
                <span className="text-yellow-400 font-bold font-sans">৳ {user.bonusBalance.toLocaleString()} BDT</span>
              </div>
            </div>

            {/* Middle Grid navigations */}
            <div className="grid grid-cols-4 gap-2 bg-[#0F172A] border border-slate-800 p-3 rounded-2xl text-center">
              <button onClick={() => setActiveSubView('txHistory')} className="flex flex-col items-center gap-1.5 p-1.5 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-all">
                <div className="w-9 h-9 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center "><Clock className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-300">লেনদেন</span>
              </button>

              <button onClick={() => setActiveSubView('betHistory')} className="flex flex-col items-center gap-1.5 p-1.5 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-all">
                <div className="w-9 h-9 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center "><Gift className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-300">বেট হিস্ট্রি</span>
              </button>

              <button onClick={() => onNavigateToTab('invite')} className="flex flex-col items-center gap-1.5 p-1.5 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-all">
                <div className="w-9 h-9 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center "><Users className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-300">আমন্ত্রণ</span>
              </button>
              
              <button onClick={onLogout} className="flex flex-col items-center gap-1.5 p-1.5 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-all group">
                <div className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500/20"><LogOut className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-rose-500 group-hover:text-rose-400">লগআউট</span>
              </button>
            </div>

            {/* List Menu Links */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
              <div onClick={() => onNavigateToTab('spin')} className="flex justify-between items-center p-4 hover:bg-slate-900 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                  <span className="text-xs font-semibold">স্পিন করে টাকা জিতুন (ফ্রি সুযোগ: {user.spinsCount})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>

              <div onClick={() => setActiveSubView('support')} className="flex justify-between items-center p-4 hover:bg-slate-900 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-yellow-555 text-yellow-550 text-yellow-500" />
                  <span className="text-xs font-semibold">গ্রাহক সেবা (২৪/৭ বাংলা চ্যাট)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>

              <div className="flex justify-between items-center p-4 text-slate-400">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-semibold">নিয়ম ও শর্তাবলী এবং গেম তথ্য</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-650 text-slate-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* MOCK DEPOSIT SCREEN */}
        {activeSubView === 'depositForm' && (
          <motion.div key="deposit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl text-center space-y-2">
              <span className="text-xs text-slate-400 block font-semibold mb-1">ব্যালেন্স লোড করতে গেটওয়ে সিলেক্ট করুন:</span>
              <div className="flex justify-around gap-2.5">
                {(['bkash', 'nagad', 'rocket'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setDepositMethod(m)}
                    className={`flex-1 py-3 text-xs font-black uppercase rounded-xl border cursor-pointer select-none transition-all flex flex-col items-center justify-center gap-1.5 ${
                      depositMethod === m
                        ? m === 'bkash'
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-md'
                          : m === 'nagad'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-450 shadow-md'
                          : 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-circle-dollar-to-slot text-base"></i>
                    {m === 'bkash' ? 'বিকাশ (bKash)' : m === 'nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction block */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-2xl text-xs text-yellow-500 space-y-2 leading-relaxed">
              <h4 className="font-bold text-yellow-550 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> আমানত করার পদ্ধতি:
              </h4>
              <p>১. নিচের দেওয়া {depositMethod === 'bkash' ? 'বিকাশ' : depositMethod === 'nagad' ? 'নগদ' : 'রকেট'} ওয়ালেট নম্বরে টাকা সেন্ডমানি (Send Money) করুন।</p>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center font-mono text-sm tracking-widest text-yellow-500 font-black select-all cursor-pointer">
                {depositMethod === 'bkash' ? '01766554433' : depositMethod === 'nagad' ? '01999887766' : '01511223344'}
              </div>
              <p>২. টাকা পাঠানো হয়ে গেলে যেই মোবাইল নম্বর থেকে পাঠিয়েছেন সেটি এবং ৮ সংখ্যার ট্রানজেকশন আইডি (TxnID) নিচের বক্সে পেস্ট করে বাটনে চাপুন।</p>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 bg-[#0F172A] border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div>
                <label className="text-[11px] text-slate-400 block font-bold mb-1">ডিপোজিট পরিমাণ কারেন্সি (BDT ৳):</label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {['200', '500', '1000', '5000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val)}
                      className={`py-1 rounded-lg font-bold text-[11px] border ${depositAmount === val ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                    >
                      ৳ {val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-sm font-sans focus:outline-none focus:border-yellow-500 font-semibold"
                  placeholder="ডিপোজিট পরিমাণ লিখুন..."
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-bold mb-1">পাঠানো মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={depositPhone}
                  onChange={e => setDepositPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-sm font-sans focus:outline-none focus:border-yellow-500 font-semibold"
                  placeholder="যেমন: 017xxxxxxxx"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-bold mb-1">ট্রানজেকশন আইডি (TxnID):</label>
                <input
                  type="text"
                  value={depositTxNo}
                  onChange={e => setDepositTxNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-sm font-mono focus:outline-none focus:border-yellow-500 font-bold uppercase"
                  placeholder="যেমন: 9JH76T99X8"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold rounded-xl cursor-pointer transition-all shadow-lg mt-1.5 text-xs"
              >
                আমানতের আবেদন সাবমিট করুন
              </button>
            </form>
          </motion.div>
        )}

        {/* MOCK WITHDRAW SCREEN */}
        {activeSubView === 'withdrawForm' && (
          <motion.div key="withdraw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl text-center space-y-2">
              <span className="text-xs text-slate-400 block font-semibold mb-1">টাকা উত্তোলন গেটওয়ে নির্ধারণ করুন:</span>
              <div className="flex justify-around gap-2.5">
                {(['bkash', 'nagad', 'rocket'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setWithdrawMethod(m)}
                    className={`flex-1 py-3 text-xs font-black uppercase rounded-xl border cursor-pointer select-none transition-all flex flex-col items-center justify-center gap-1.5 ${
                      withdrawMethod === m
                        ? m === 'bkash'
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-md'
                          : m === 'nagad'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-450 shadow-md'
                          : 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-circle-check text-base"></i>
                    {m === 'bkash' ? 'বিকাশ' : m === 'nagad' ? 'নগদ' : 'রকেট'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3 bg-[#0F172A] border border-slate-800 p-4 rounded-xl shadow-lg">
              <div>
                <label className="text-[11px] text-slate-400 block font-bold mb-1">টাকা উত্তোলনের পরিমাণ (৳):</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-sm font-sans focus:outline-none focus:border-yellow-500 font-semibold"
                  placeholder="সর্বনিম্ন ৫০০ টাকা..."
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">সর্বোচ্চ একক লিমিট: ৳৫০,০০০ পর্যন্ত</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-bold mb-1">পেমেন্ট রিসিভার মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={withdrawPhone}
                  onChange={e => setWithdrawPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-sm font-sans focus:outline-none focus:border-yellow-500 font-semibold"
                  placeholder="যেমন: 017xxxxxxxx"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg mt-2 text-xs"
              >
                উত্তোলনের আবেদন জমা দিন
              </button>
            </form>
          </motion.div>
        )}

        {/* TRANSACTIONS HISTORY SCREEN */}
        {activeSubView === 'txHistory' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <h3 className="text-sm font-bold text-slate-400 px-1 mb-2">সাম্প্রতিক লেনদেন সমূহ:</h3>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-550 text-xs">আজ কোনো লেনদেন হয়নি!</div>
              ) : (
                transactions.map(item => (
                  <div key={item.id} className="bg-[#0F172A] border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.type === 'deposit' ? 'bg-sky-500' : item.type === 'withdrawal' ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                        {item.type === 'deposit' ? 'ডিপোজিট বিবরণ' : item.type === 'withdrawal' ? 'টাকা উত্তোলন' : item.type === 'spin_win' ? 'স্পিন চাকা জয়' : 'দৈনিক রিওয়ার্ড'}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">{item.createdAt} | {item.paymentMethod ? `${item.paymentMethod} (${item.accountNo})` : 'সিস্টেম মডিউল'}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-bold font-sans ${item.type === 'withdrawal' ? 'text-amber-500' : 'text-yellow-500'}`}>
                        {item.type === 'withdrawal' ? '-' : '+'}৳{item.amount}
                      </span>
                      <span className={`text-[10px] block font-semibold mt-1 ${item.status === 'success' ? 'text-yellow-500' : item.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>
                        {item.status === 'success' ? 'সফল হয়েছে' : item.status === 'pending' ? 'অপেক্ষমাণ' : 'বাতিল'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* BET HISTORY VIEW */}
        {activeSubView === 'betHistory' && (
          <motion.div key="bethistory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <h3 className="text-sm font-bold text-slate-400 px-1 mb-2">বেটিং রেকর্ড সমূহ:</h3>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {betHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-550 text-xs">আজ কোনো বেট ধরা হয়নি! গেম ক্যাটাগরি প্লে করুন।</div>
              ) : (
                betHistory.map(b => (
                  <div key={b.id} className="bg-[#0F172A] border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs text-sans">
                    <div>
                      <span className="font-extrabold text-slate-200 block text-xs">{b.gameTitle}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{b.createdAt}</span>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">बेট: ৳{b.betAmount}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">জিত: ৳{b.winAmount}</span>
                      </div>
                      <span className={`text-xs font-black font-sans p-1.5 rounded-lg ${b.result === 'win' ? 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {b.result === 'win' ? `+${b.payoutMultiplier}x` : 'পরাজয়'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* CHAT SUPPORT VIEW SYSTEM */}
        {activeSubView === 'support' && (
          <motion.div key="support" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-[520px]">
            {/* Top Indicator */}
            <div className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-t-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
              <div className="text-xs">
                <span className="text-white font-bold block leading-none">লাইভ সাপোর্ট সার্ভিস</span>
                <span className="text-[10px] text-slate-400 mt-1 block">অনলাইন এজেন্ট (বাংলা অনুবাদ সচল)</span>
              </div>
            </div>

            {/* Message lists */}
            <div className="flex-1 bg-slate-950 p-3 overflow-y-auto space-y-3 flex flex-col pt-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] text-xs p-3 rounded-xl flex flex-col ${msg.sender === 'user' ? 'bg-yellow-500 text-slate-950 self-end rounded-tr-none font-semibold' : 'bg-[#0F172A] border border-slate-800 text-slate-200 self-start rounded-tl-none'}`}>
                  <span>{msg.text}</span>
                  <span className="text-[9px] text-slate-500 text-right mt-1 block">{msg.time}</span>
                </div>
              ))}
              {isAgentTyping && (
                <div className="bg-slate-900 text-slate-400 p-2.5 rounded-xl self-start text-[11px] font-medium flex items-center gap-1.5 animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  এজেন্ট লিখছেন...
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSupportSend} className="p-2 border-t border-slate-800 bg-[#0F172A] flex gap-2 rounded-b-xl">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="আপনার বার্তার বিবরণ লিখুন..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-200 focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="bg-yellow-550 bg-yellow-500 hover:bg-yellow-600 text-slate-950 p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center shrink-0 shadow font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
