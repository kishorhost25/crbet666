import React, { useState } from 'react';
import { UserNotification } from '../types';
import { motion } from 'motion/react';
import {
  Bell,
  Trash2,
  CheckCheck,
  ChevronRight,
  Info,
  Gift,
  DollarSign,
  Crown,
  Gamepad2,
  X,
  AlertCircle
} from 'lucide-react';

interface NotificationsPageProps {
  notifications: UserNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onBack: () => void;
  onNavigateToTab: (tabName: 'home' | 'deposit' | 'invite' | 'promotion' | 'profile' | 'account') => void;
}

export default function NotificationsPage({
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onDeleteNotification,
  onClearAll,
  onBack,
  onNavigateToTab
}: NotificationsPageProps) {
  const [filter, setFilter] = useState<'all' | 'system' | 'payment' | 'bonus'>('all');

  // Filter logic
  const filteredList = notifications.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'system') return item.type === 'system' || item.type === 'game';
    if (filter === 'payment') return item.type === 'payment';
    if (filter === 'bonus') return item.type === 'bonus' || item.type === 'vip';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render proper icon based on notification type
  const getNotificationIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'system':
      case 'game':
        return (
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 bg-[#00b986]/10 border border-[#00b986]/20 rounded-xl flex items-center justify-center text-[#00b986] shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        );
      case 'bonus':
        return (
          <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
        );
      case 'vip':
        return (
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  // Get localized type badge
  const getTypeLabelAndClass = (type: UserNotification['type']) => {
    switch (type) {
      case 'system':
        return { label: 'সিস্টেম বার্তা', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/25' };
      case 'game':
        return { label: 'গেম আপডেট', class: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' };
      case 'payment':
        return { label: 'লেনদেন এলার্ট', class: 'bg-[#00b986]/10 text-[#00b986] border border-[#00b986]/25' };
      case 'bonus':
        return { label: 'বোনাস কুপন', class: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' };
      case 'vip':
        return { label: 'ভিআইপি ক্লাব', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/25' };
      default:
        return { label: 'নোটিফিকেশন', class: 'bg-slate-500/10 text-slate-400 border border-slate-500/25' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in text-sans select-none pb-12">
      
      {/* HEADER CONTROLS BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-450 hover:text-white hover:bg-rose-600/10 transition-all cursor-pointer bg-slate-900 border border-slate-800 hover:border-rose-500/30 px-3.5 py-1.5 rounded-xl text-rose-400"
        >
          <X className="w-4 h-4 text-rose-500" /> বন্ধ করুন
        </button>
        <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 animate-pulse" /> লাইভ ইনবক্স
        </span>
      </div>

      {/* COMPACT STATS BOARD AND DECORATIONS */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">অপঠিত বার্তা</p>
            <p className="text-2xl font-black text-yellow-500 font-sans mt-0.5">{unreadCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-yellow-500/5 border border-yellow-500/15 flex items-center justify-center text-yellow-500">
            <Bell className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">মোট নোটিফিকেশন</p>
            <p className="text-2xl font-black text-slate-300 font-sans mt-0.5">{notifications.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-800/40 border border-slate-750 flex items-center justify-center text-slate-400">
            <AlertCircle className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* CONTROLS & FILTER TABS */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-3.5 space-y-3 shadow-md">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1 bg-[#0b0f19]/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`text-[10.5px] px-3.5 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-yellow-500 text-slate-950 font-black scale-[1.01] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              সব ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`text-[10.5px] px-3.5 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
                filter === 'system'
                  ? 'bg-yellow-500 text-slate-950 font-black scale-[1.01] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              সিস্টেম
            </button>
            <button
              onClick={() => setFilter('payment')}
              className={`text-[10.5px] px-3.5 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
                filter === 'payment'
                  ? 'bg-yellow-500 text-slate-950 font-black scale-[1.01] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              লেনদেন
            </button>
            <button
              onClick={() => setFilter('bonus')}
              className={`text-[10.5px] px-3.5 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
                filter === 'bonus'
                  ? 'bg-yellow-500 text-slate-950 font-black scale-[1.01] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বোনাস ও অফার
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                title="সব পঠিত করুন"
                className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 font-bold px-2.5 py-1.5 rounded-lg transition-transform cursor-pointer hover:scale-102"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#00b986]" /> সব পঠিত
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="সব বার্তা ডিলিট"
                className="flex items-center gap-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold px-2.5 py-1.5 rounded-lg transition-transform cursor-pointer hover:scale-102"
              >
                <Trash2 className="w-3.5 h-3.5" /> মুছে ফেলুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NOTIFICATION ITEM INBOX LIST VIEW */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-[#1E293B] rounded-2xl border border-slate-750/80 leading-relaxed flex flex-col items-center justify-center space-y-2">
            <span className="text-4xl text-slate-500">📬</span>
            <p className="font-bold text-slate-400">এই ক্যাটাগরিতে কোনো নোটিফিকেশন তথ্য পাওয়া যায়নি!</p>
            <p className="text-[10px] text-slate-500 font-sans">নতুন অফার, প্রমোশনাল কুপন ও পেমেন্ট আপডেট থাকলে এখানে শো করা হবে।</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredList.map((notify) => {
              const badge = getTypeLabelAndClass(notify.type);
              return (
                <div
                  key={notify.id}
                  onClick={() => onMarkAsRead(notify.id)}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 transform leading-relaxed select-none ${
                    notify.isRead
                      ? 'bg-[#1E293B]/60 border-slate-800/80 hover:bg-[#1E293B]/70'
                      : 'bg-gradient-to-r from-slate-900 to-slate-850 border-yellow-500/30 hover:shadow-lg shadow-yellow-500/5 scale-[1.005]'
                  }`}
                >
                  {/* Unread tiny pulsing indicator */}
                  {!notify.isRead && (
                    <span className="absolute top-4.5 right-4.5 w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                  )}

                  <div className="flex gap-4 items-start">
                    {/* Visual icon representation */}
                    {getNotificationIcon(notify.type)}

                    {/* Content text */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${badge.class}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-sans">
                          {notify.createdAt}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-snug tracking-wide ${notify.isRead ? 'text-slate-300' : 'text-slate-100 font-extrabold'}`}>
                        {notify.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 font-semibold font-sans leading-relaxed">
                        {notify.description}
                      </p>

                      {/* Optional Action block deep linking to target page layout */}
                      {notify.actionTab && (
                        <div className="pt-2 flex justify-start">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Mark as read first
                              onMarkAsRead(notify.id);
                              // Route
                              onNavigateToTab(notify.actionTab!);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] text-yellow-400 hover:text-white font-extrabold select-none hover:underline cursor-pointer transition-colors bg-yellow-500/5 px-2.5 py-1 border border-yellow-500/10 rounded-lg hover:bg-yellow-500/15"
                          >
                            <span>বিস্তারিত দেখুন</span>
                            <ChevronRight className="w-3 h-3 text-yellow-500 animate-pulse" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Simple single item dismiss trash triggers */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notify.id);
                      }}
                      title="সরিয়ে ফেলুন"
                      className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg cursor-pointer transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DISCLAIMER SECURITY NOTE */}
      <div className="p-4 bg-slate-900/45 border border-slate-850 rounded-2xl flex items-start gap-2.5 text-slate-500">
        <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed font-semibold">
          গ্রাহকের অ্যাকাউন্ট সিকিউরিটি নিশ্চিত করতে ট্রানজেকশন ডেটা ও প্রমোশনাল অফার বার্তা ২৪ ঘণ্টা সচল রাখার পর স্বয়ংক্রিয়ভাবে ক্লিনআপ হয়। কোনো অতিরিক্ত সহায়তার জন্য লাইভ সাপোর্ট এজেন্টের সাথে যোগাযোগ করুন।
        </p>
      </div>

    </div>
  );
}
