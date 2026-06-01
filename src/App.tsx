import React, { useState, useEffect } from 'react';
import { GameDefinition, UserProfile, Transaction, BetRecord, JackpotWinner, UserNotification } from './types';
import { gamesList } from './gamesData';
import SlotMachineModal from './components/SlotMachineModal';
import UserProfilePanel from './components/UserProfilePanel';
import DepositPage from './components/DepositPage';
import AccountTrackerPage from './components/AccountTrackerPage';
import SpinWheelModal from './components/SpinWheelModal';
import AuthModal from './components/AuthModal';
import NotificationsPage from './components/NotificationsPage';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Search,
  Bell,
  Volume2,
  CalendarCheck,
  Award,
  Crown,
  Gift,
  Coins,
  ChevronRight,
  Users,
  HelpCircle,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const crbetLogo = "/images/crbet_logo_new_1779706051709.png";

const PROMO_SLIDES = [
  {
    id: 'login-offer',
    image: "/images/login_offer_1780267934072.png",
    title: '৳১৬৮ লগইন বোনাস লুফে নিন!',
    desc: 'সিআরবেটে সাইন-ইন বা লগইন করে ইনস্ট্যান্ট ৳১৬৮ টাকা ফ্রি ক্যাশ পুরস্কার জয় করুন।',
    badge: 'লগইন অফার 🎁',
    btnText: 'এখনই খেলুন',
    action: 'login'
  },
  {
    id: 'share-offer',
    image: "/images/share_offer_1780267953582.png",
    title: 'বন্ধু রেফারে পান ৳৫০০ ক্যাশ ব্যাক!',
    desc: 'আপনার কাস্টম লিংক কপি করে বন্ধুদের সাথে শেয়ার করে জিতে নিন ৫০০ টাকা!',
    badge: 'রিয়েল শেয়ার অফার ✉️',
    btnText: 'বন্ধুদের ইনভাইট করুন',
    action: 'share'
  },
  {
    id: 'red-envelope-rain',
    image: "/images/bonus_offer_1780267979762.png",
    title: 'মেগা লাল খাম বৃষ্টি বোনাস!',
    desc: 'প্রতিদিন ৮ বার আকাশে উড়ে বেড়ায় লাল খাম সমৃদ্ধি! ওয়ান-ট্যাপে সরাসরি ক্লেইম করুন ৳১,০০০,০০০ পর্যন্ত।',
    badge: 'মেগা খাম বৃষ্টি 🧧',
    btnText: 'বৃষ্টিতে যোগ দিন',
    action: 'red-envelope'
  },
  {
    id: 'deposit-bonus',
    image: "/images/deposit_promo_offer_1780267997661.png",
    title: '১০০% ডাবল ডিপোজিট ম্যাচ!',
    desc: 'প্রথমবার ডিপোজিটেই পেয়ে যান শতভাগ ইনস্ট্যান্ট ডাবল ব্যালেন্স এবং ২৫% এক্সট্রা ব্যাক।',
    badge: 'প্রথম আমানত বোনাস 💰',
    btnText: 'আমানত করুন',
    action: 'deposit'
  }
];

// Demo initial transaction records
const INITIAL_TXNS: Transaction[] = [];
const INITIAL_BETS: BetRecord[] = [];

const INITIAL_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'welcome-bonus',
    title: 'স্বাগতম ক্যাশ বোনাস ল্যান্ডেড! 🎁',
    description: 'সিআরবেট৬৬৬ প্ল্যাটফর্মে আপনাকে স্পেশাল স্বাগত! সফলভাবে অ্যাকাউন্ট তৈরির জন্য আপনার অ্যাকাউন্টে সরাসরি স্বাগত বোনাস ক্রেডিট করা হয়েছে।',
    createdAt: 'আজ, ০৮:১৫ PM',
    isRead: false,
    type: 'bonus',
    actionTab: 'profile'
  },
  {
    id: 'deposit-promo',
    title: '১৬৮ টাকা ডিপোজিট ফ্লাশ বোনাস এখন সচল! 💳',
    description: 'বিকাশ বা নগদ ব্যবহার করে প্রথমবার আমানত (সর্বনিম্ন ৫০০ BDT) করলেই পাচ্ছেন ১৬৮ টাকা অতিরিক্ত ক্যাশ বোনাস এবং মেগা লাকি ড্র কুপন!',
    createdAt: 'আজ, ০৭:২০ PM',
    isRead: false,
    type: 'payment',
    actionTab: 'deposit'
  },
  {
    id: 'red-envelope-rain',
    title: 'লাল খাম বৃষ্টি শুরু হয়েছে! 🧧⚡',
    description: 'আজকের মেগা লাল খাম বৃষ্টি অফারে সর্বোচ্চ ১,০০০,০০০ টাকা সরাসরি ব্যালেন্সে জেতার মেগা সুযোগ রয়েছে। স্ক্রিনের উপরের ব্যানার থেকে এখনই অফারটি ক্লেইম করুন!',
    createdAt: 'আজ, ০৪:১০ PM',
    isRead: true,
    type: 'system',
    actionTab: 'home'
  },
  {
    id: 'vip-level-up',
    title: 'ভিআইপি ২ ব্রোঞ্জ ক্লাব প্রমোশন! 👑',
    description: 'অভিনন্দন! আপনার অ্যাকাউন্ট বাজি ও ট্রানজেকশন অ্যাক্টিভিটি বৃদ্ধির জন্য আপনি ব্রোঞ্জ ক্লাবের সুযোগ সুবিধা ও ৫% বেশি ডিপোজিট ক্যাশ কুপন পাচ্ছেন।',
    createdAt: 'গতকাল, ১০:৫০ PM',
    isRead: true,
    type: 'vip',
    actionTab: 'profile'
  }
];

// Static list of live winners ticking on sidebar
const STATIC_WINNERS: JackpotWinner[] = [
  { username: 'Limon_88', amount: 8400, time: '১ মিনিট আগে', game: 'Super Ace' },
  { username: 'RakibHasan', amount: 35000, time: '২ মিনিট আগে', game: 'Crazy 777' },
  { username: 'Mitu_Chy', amount: 12000, time: '৩ মিনিট আগে', game: 'Golden Empire' },
  { username: 'SiamSarker', amount: 150000, time: '৪ মিনিট আগে', game: 'Mega Ace' },
  { username: 'BipuSikder', amount: 2400, time: '৫ মিনিট আগে', game: 'Ali Baba' },
];

export default function App() {
  // --- States ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>(() => {
    try {
      const stored = localStorage.getItem('crbet_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('crbet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Layout selections
  const [activeTab, setActiveTab] = useState<'home' | 'deposit' | 'invite' | 'promotion' | 'profile' | 'account' | 'notifications'>('home');
  const [activeCategory, setActiveCategory] = useState<'hot' | 'slot' | 'live' | 'fish'>('slot');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals active states
  const [activeSlotGame, setActiveSlotGame] = useState<GameDefinition | null>(null);
  const [isSpinActive, setIsSpinActive] = useState<boolean>(false);
  const [isAuthActive, setIsAuthActive] = useState<{ active: boolean; tab: 'login' | 'register' }>({ active: false, tab: 'login' });
  const [footerModal, setFooterModal] = useState<{ isOpen: boolean; title: string; content: string; icon: string }>({ isOpen: false, title: '', content: '', icon: '' });

  // Simulated live properties
  const [jackpotPool, setJackpotPool] = useState<number>(1450280);
  const [recentWinners, setRecentWinners] = useState<JackpotWinner[]>(STATIC_WINNERS);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [redEnvelopeClaimed, setRedEnvelopeClaimed] = useState<boolean>(false);

  // Promo slider index and hover states
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isSliderHovered, setIsSliderHovered] = useState<boolean>(false);

  // Auto advance promo slider
  useEffect(() => {
    if (isSliderHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % PROMO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSliderHovered]);

  const handlePromoSlideClick = (action: string) => {
    switch (action) {
      case 'login':
        if (!user) {
          setIsAuthActive({ active: true, tab: 'login' });
        } else {
          setActiveTab('profile');
        }
        break;
      case 'share':
        if (!user) {
          setIsAuthActive({ active: true, tab: 'login' });
        } else {
          setActiveTab('invite');
        }
        break;
      case 'red-envelope':
        handleRedEnvelopeClaim();
        break;
      case 'deposit':
        if (!user) {
          setIsAuthActive({ active: true, tab: 'login' });
        } else {
          setActiveTab('deposit');
        }
        break;
      default:
        break;
    }
  };

  // Initialize and load accounts cache on browser boot up and start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setUser(profile);
            localStorage.setItem('crbet_user_profile', JSON.stringify(profile));
            
            // Dynamic collection query and loader
            const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
            try {
              const txSnap = await getDocs(query(collection(db, 'users', firebaseUser.uid, 'transactions'), orderBy('createdAt', 'desc')));
              const loadedTx: Transaction[] = [];
              txSnap.forEach(d => {
                loadedTx.push(d.data() as Transaction);
              });
              setTransactions(loadedTx);
              localStorage.setItem('crbet_transactions', JSON.stringify(loadedTx));
            } catch (errTx) {
              console.warn("Transactions subcollection read error:", errTx);
            }

            try {
              const betsSnap = await getDocs(query(collection(db, 'users', firebaseUser.uid, 'bets'), orderBy('createdAt', 'desc')));
              const loadedBets: BetRecord[] = [];
              betsSnap.forEach(d => {
                loadedBets.push(d.data() as BetRecord);
              });
              setBetHistory(loadedBets);
              localStorage.setItem('crbet_bethistory', JSON.stringify(loadedBets));
            } catch (errBet) {
              console.warn("Bets subcollection read error:", errBet);
            }
          } else {
            const storedUser = localStorage.getItem('crbet_user_profile');
            if (storedUser) {
              const u = JSON.parse(storedUser);
              u.uid = firebaseUser.uid;
              setUser(u);
              await setDoc(userRef, u);
            }
          }
        } catch (error: any) {
          const isOffline = error && (
            (error.message && (
              error.message.includes('offline') ||
              error.message.includes('Failed to get document') ||
              error.message.includes('network')
            )) ||
            (error.code === 'unavailable') ||
            String(error).includes('offline') ||
            String(error).includes('Failed to get document')
          );
          if (isOffline) {
            console.warn("Firestore client is offline - recovering profile details from local storage cache gracefully:", error);
            try {
              const storedUser = localStorage.getItem('crbet_user_profile');
              const storedTxns = localStorage.getItem('crbet_transactions');
              const storedBets = localStorage.getItem('crbet_bethistory');

              if (storedUser) setUser(JSON.parse(storedUser));
              if (storedTxns) setTransactions(JSON.parse(storedTxns));
              if (storedBets) setBetHistory(JSON.parse(storedBets));
            } catch (e) {
              console.error("Local storage load fallback error under offline condition:", e);
            }
          } else {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          }
        }
      } else {
        try {
          const storedUser = localStorage.getItem('crbet_user_profile');
          const storedTxns = localStorage.getItem('crbet_transactions');
          const storedBets = localStorage.getItem('crbet_bethistory');

          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedTxns) setTransactions(JSON.parse(storedTxns));
          if (storedBets) setBetHistory(JSON.parse(storedBets));
        } catch (e) {
          console.error("Local storage load fallback error:", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Update localStorage when details changes
  const handleDbError = (error: any, operationType: OperationType, path: string) => {
    const isOffline = error && (
      (error.message && (
        error.message.includes('offline') ||
        error.message.includes('Failed to get document') ||
        error.message.includes('network')
      )) ||
      (error.code === 'unavailable') ||
      String(error).includes('offline') ||
      String(error).includes('Failed to get document')
    );
    if (isOffline) {
      console.warn(`Firestore save skipped: client is offline at ${path}.`, error);
    } else {
      handleFirestoreError(error, operationType, path);
    }
  };

  const saveUserData = async (updatedProfile: UserProfile | null) => {
    setUser(updatedProfile);
    if (updatedProfile) {
      localStorage.setItem('crbet_user_profile', JSON.stringify(updatedProfile));
      if (auth.currentUser) {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'users', auth.currentUser.uid), updatedProfile);
        } catch (error: any) {
          handleDbError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
        }
      }
    } else {
      localStorage.removeItem('crbet_user_profile');
    }
  };

  const saveTxnsData = async (updatedTxns: Transaction[]) => {
    setTransactions(updatedTxns);
    localStorage.setItem('crbet_transactions', JSON.stringify(updatedTxns));
  };

  const saveBetsData = async (updatedBets: BetRecord[]) => {
    setBetHistory(updatedBets);
    localStorage.setItem('crbet_bethistory', JSON.stringify(updatedBets));
  };

  // Simulated Jackpot pool incrementing over time
  useEffect(() => {
    const term = setInterval(() => {
      setJackpotPool(prev => prev + Math.floor(Math.random() * 5 + 1));
    }, 1800);
    return () => clearInterval(term);
  }, []);

  // Live winners feed simulation ticker
  useEffect(() => {
    const term = setInterval(() => {
      const liveGames = ['Super Ace', 'Crazy 777', 'Boxing King', 'Golden Empire', 'Ali Baba', 'Jili Caishen'];
      const liveUsers = ['Faruk_1', 'Anika_Chy', 'SohagChow', 'Shimul_Vip', 'MimRani', 'SajidKing', 'Tamim99', 'RupaVip'];
      const luckyAmt = Math.floor(Math.random() * 15 + 1) * 500;
      const newWin: JackpotWinner = {
        username: `${liveUsers[Math.floor(Math.random() * liveUsers.length)]}_${Math.floor(Math.random() * 90 + 10)}`,
        amount: luckyAmt,
        time: 'এইমাত্র',
        game: liveGames[Math.floor(Math.random() * liveGames.length)],
      };
      setRecentWinners(prev => [newWin, ...prev.slice(0, 4)]);
    }, 6000);
    return () => clearInterval(term);
  }, []);

  // --- Core Handlers ---

  const handleAuthSuccess = async (usernameStr: string, isGuest: boolean, welcomeAmountValue: number = 0) => {
    try {
      let uid = "";
      let isFallback = false;
      try {
        const userCredential = await signInAnonymously(auth);
        uid = userCredential.user.uid;
      } catch (authError: any) {
        const isAuthRestricted = authError && (
          authError.code === 'auth/admin-restricted-operation' ||
          String(authError).includes('admin-restricted-operation')
        );
        if (isAuthRestricted) {
          console.error(
            "Firebase Authentication error: 'auth/admin-restricted-operation'.\n" +
            "To fix this live on your Firebase backend: \n" +
            "1. Go to Firebase Console -> Authentication -> Sign-in method\n" +
            "2. Click 'Add new provider' and enable 'Anonymous'.\n" +
            "Falling back to local persistent sandbox session."
          );
          alert(
            "ফায়ারবেস অথেনটিকেশন কনফিগারেশন রিকোয়ারমেন্ট:\n" +
            "ক্রিয়েটর প্যানেল এর ফায়ারবেস কনসোলে 'Anonymous' সাইন-ইন প্রোভাইডার নিষ্ক্রিয় রয়েছে।\n\n" +
            "গেমটি সুন্দরভাবে পরীক্ষা করার সুবিধার জন্য আপনাকে 'লোকাল স্যান্ডবক্স মোডে' প্রবেশ করানো হচ্ছে।"
          );
          uid = `local_${Math.random().toString(36).substring(2, 10)}`;
          isFallback = true;
        } else {
          throw authError;
        }
      }

      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const guestCoins = isGuest ? 10000 : 200; // Guest accounts start with BDT 10k free demo credits

      const newProfile: UserProfile = {
        uid: uid, // MUST match firebase credential uid or local fallback
        username: usernameStr,
        balance: guestCoins + welcomeAmountValue,
        bonusBalance: welcomeAmountValue > 0 ? 100 : 100, // extra signup credits
        vipLevel: 1,
        totalDeposits: 0,
        totalBets: 0,
        isGuest,
        createdAt: new Date().toLocaleDateString('bn-BD'),
        lastCheckIn: null,
        spinsCount: 1, // 1 free spins trigger daily slot wheel
        referralCode: `CRB${randomCode}`,
      };

      await saveUserData(newProfile);
      setTransactions([]);
      setBetHistory([]);

      // Welcome registration transaction record
      if (welcomeAmountValue > 0 || isGuest) {
        const initialRewardTxn: Transaction = {
          id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          userId: newProfile.uid,
          type: 'reward',
          amount: isGuest ? 10000 : welcomeAmountValue,
          status: 'success',
          createdAt: new Date().toLocaleTimeString('bn-BD'),
          description: isGuest ? 'ফ্রি ডেমো ক্রেডিট প্রাপ্তি' : 'নতুন অ্যাকাউন্ট স্বাগত বোনাস',
        };
        setTransactions([initialRewardTxn]);
        localStorage.setItem('crbet_transactions', JSON.stringify([initialRewardTxn]));
        
        if (!isFallback) {
          try {
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', uid, 'transactions', initialRewardTxn.id), initialRewardTxn);
          } catch (err: any) {
            handleDbError(err, OperationType.WRITE, `users/${uid}/transactions/${initialRewardTxn.id}`);
          }
        }
      }
    } catch (error) {
      console.error("Firebase auth registration failed:", error);
      alert("নিবন্ধন ব্যর্থ হয়েছে! অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পুনরায় পরীক্ষা করুন।");
    }
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signout error:", e);
    }
    setActiveTab('home');
    setUser(null);
    setTransactions([]);
    setBetHistory([]);
    localStorage.removeItem('crbet_user_profile');
    localStorage.removeItem('crbet_transactions');
    localStorage.removeItem('crbet_bethistory');
  };

  // Bet records integrations with Slot Reel results
  const handleBetPlacedResult = async (
    betCost: number,
    winReward: number,
    multiplier: number,
    resultType: 'win' | 'loss'
  ) => {
    if (!user) return;

    // Deduct bet cost and add win credits
    const balanceDiff = winReward - betCost;
    const finalBalance = Math.max(0, user.balance + balanceDiff);
    const finalBets = user.totalBets + betCost;

    // Calculate VIP Level adjustments: VIP levels up every ৳5,000 deposits or ৳25,000 total turnover bets
    const calculatedVip = Math.min(10, Math.floor(finalBets / 15000) + 1);

    const updatedProfile: UserProfile = {
      ...user,
      balance: finalBalance,
      totalBets: finalBets,
      vipLevel: calculatedVip,
    };

    await saveUserData(updatedProfile);

    // Write bet history statement
    const newBetRecord: BetRecord = {
      id: `BET_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      userId: user.uid,
      gameId: activeSlotGame?.id || 'game-slots',
      gameTitle: activeSlotGame?.title || 'Mini Slot Match',
      betAmount: betCost,
      winAmount: winReward,
      payoutMultiplier: Number(multiplier.toFixed(1)),
      result: resultType,
      createdAt: new Date().toLocaleTimeString('bn-BD'),
    };
    await saveBetsData([newBetRecord, ...betHistory]);

    if (auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'bets', newBetRecord.id), newBetRecord);
      } catch (err: any) {
        handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/bets/${newBetRecord.id}`);
      }
    }

    // If winning match, log as system transaction too
    if (winReward > 0) {
      const winTx: Transaction = {
        id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        userId: user.uid,
        type: 'bet_win',
        amount: winReward,
        status: 'success',
        createdAt: new Date().toLocaleTimeString('bn-BD'),
        description: `${activeSlotGame?.title} স্লট মেশিন জয়`,
      };
      await saveTxnsData([winTx, ...transactions]);

      if (auth.currentUser) {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', winTx.id), winTx);
        } catch (err: any) {
          handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/transactions/${winTx.id}`);
        }
      }
    }
  };

  // Mock deposit approvals
  const handleDepositRequest = async (
    depositAmt: number,
    paymentGateway: 'bkash' | 'nagad' | 'rocket',
    phoneNo: string,
    trxIdString: string
  ) => {
    if (!user) return;

    // Auto approve after 1 second for premium mockup satisfaction
    const newTx: Transaction = {
      id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      userId: user.uid,
      type: 'deposit',
      amount: depositAmt,
      paymentMethod: paymentGateway,
      accountNo: phoneNo,
      txnId: trxIdString,
      status: 'success', // Instantly completed in mock env
      createdAt: new Date().toLocaleTimeString('bn-BD'),
      description: `${paymentGateway.toUpperCase()} এর মাধ্যমে সরাসরি পেমেন্ট প্রাপ্তি`,
    };

    await saveTxnsData([newTx, ...transactions]);

    const updatedProfile: UserProfile = {
      ...user,
      balance: user.balance + depositAmt,
      totalDeposits: user.totalDeposits + depositAmt,
    };
    await saveUserData(updatedProfile);

    // Create deposit notification
    const depNotification: UserNotification = {
      id: `notify-dep-${Date.now()}`,
      title: `৳${depositAmt} আমানত সফল হয়েছে! 💳`,
      description: `${paymentGateway.toUpperCase()} ওয়ালেট নম্বর (${phoneNo}) এবং ট্রানজেকশন ID (${trxIdString}) দিয়ে পাঠানো টাকা সফলভাবে জমা হয়েছে।`,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'payment',
      actionTab: 'profile'
    };
    setNotifications(prev => [depNotification, ...prev]);

    if (auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', newTx.id), newTx);
      } catch (err: any) {
        handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/transactions/${newTx.id}`);
      }
    }
  };

  // Mock withdrawal requests
  const handleWithdrawalRequest = async (
    withdrawAmt: number,
    paymentGateway: 'bkash' | 'nagad' | 'rocket',
    phoneNo: string
  ) => {
    if (!user) return;

    const newTx: Transaction = {
      id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      userId: user.uid,
      type: 'withdrawal',
      amount: withdrawAmt,
      paymentMethod: paymentGateway,
      accountNo: phoneNo,
      status: 'pending', // Pending approved simulation
      createdAt: new Date().toLocaleTimeString('bn-BD'),
      description: `${paymentGateway.toUpperCase()} ওয়ালেটে সফলভাবে স্থানান্তর প্রক্রিয়া শুরু`,
    };

    await saveTxnsData([newTx, ...transactions]);

    const updatedProfile: UserProfile = {
      ...user,
      balance: Math.max(0, user.balance - withdrawAmt),
    };
    await saveUserData(updatedProfile);

    // Create withdrawal notification
    const wdNotification: UserNotification = {
      id: `notify-wd-${Date.now()}`,
      title: `৳${withdrawAmt} উত্তোলন প্রক্রিয়াধীন! 💸`,
      description: `আপনার অনুরোধকৃত ৳${withdrawAmt} তোলার প্রক্রিয়াটি আপনার দেওয়া ${paymentGateway.toUpperCase()} ওয়ালেটে (${phoneNo}) স্থানান্তর করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।`,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'payment',
      actionTab: 'profile'
    };
    setNotifications(prev => [wdNotification, ...prev]);

    if (auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', newTx.id), newTx);
      } catch (err: any) {
        handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/transactions/${newTx.id}`);
      }
    }
  };

  // Daily sign-in claim reward logic
  const handleDailyCheckIn = async () => {
    if (!user) {
      setIsAuthActive({ active: true, tab: 'login' });
      return;
    }

    const todayStr = new Date().toLocaleDateString('bn-BD');
    if (user.lastCheckIn === todayStr) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          osc.frequency.value = 160;
          osc.connect(ctx.destination);
          osc.start(); osc.stop(ctx.currentTime + 0.2);
        }
      } catch (e) {}
      alert('আপনি আজকের দৈনিক সাইন-ইন পুরস্কার ইতিমধ্যেই দাবি করেছেন! আগামীকাল আবার চেষ্টা করুন।');
      return;
    }

    const rewardCoinValue = 18; // 18 BDT standard login bonus
    const updatedProfile: UserProfile = {
      ...user,
      balance: user.balance + rewardCoinValue,
      lastCheckIn: todayStr,
      spinsCount: user.spinsCount + 1, // Award 1 free spin coupon too!
    };
    await saveUserData(updatedProfile);

    const newTx: Transaction = {
      id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      userId: user.uid,
      type: 'reward',
      amount: rewardCoinValue,
      status: 'success',
      createdAt: new Date().toLocaleTimeString('bn-BD'),
      description: 'দৈনিক অ্যাটেনডেন্স ক্যাসিনো পুরস্কার',
    };
    await saveTxnsData([newTx, ...transactions]);

    // Create Checkin notification
    const checkinNotification: UserNotification = {
      id: `notify-checkin-${Date.now()}`,
      title: 'দৈনিক সাইন-ইন সফল! 📅',
      description: `অভিনন্দন! আপনার অ্যাটেনডেন্স রেকর্ড সেট হয়েছে। আপনি পেয়েছেন ৳${rewardCoinValue} এবং ১টি ওয়ান-ক্লিক ফ্রি প্রাইজ স্পিন হুইল কুপন!`,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'bonus',
      actionTab: 'profile'
    };
    setNotifications(prev => [checkinNotification, ...prev]);

    if (auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', newTx.id), newTx);
      } catch (err: any) {
        handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/transactions/${newTx.id}`);
      }
    }

    alert(`অভিনন্দন! আপনার সাইন-ইন সফল হয়েছে। আপনি পেয়েছেন ৳${rewardCoinValue} টাকা এবং ১টি সম্পূর্ণ ফ্রি লাকি স্পিন কুপন!`);
  };

  // Claim spin reward logic
  const handleSpinResultWin = async (winAmountBDT: number, isFreeCoupon: boolean) => {
    if (!user) return;

    const remainingSpins = isFreeCoupon ? Math.max(0, user.spinsCount - 1) : user.spinsCount;
    const balanceDeduction = isFreeCoupon ? 0 : 100;

    const updatedProfile: UserProfile = {
      ...user,
      balance: user.balance - balanceDeduction + winAmountBDT,
      spinsCount: remainingSpins,
    };
    await saveUserData(updatedProfile);

    const spinTx: Transaction = {
      id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      userId: user.uid,
      type: 'spin_win',
      amount: winAmountBDT,
      status: 'success',
      createdAt: new Date().toLocaleTimeString('bn-BD'),
      description: 'লাকি স্পিন হুইল জয়ী কুপন',
    };
    await saveTxnsData([spinTx, ...transactions]);

    // Create Spin win notification
    const spinNotification: UserNotification = {
      id: `notify-spin-${Date.now()}`,
      title: `স্পিন হুইল উইন: ৳${winAmountBDT}! 🎯`,
      description: `লাকি ড্র চাকা ঘুরিয়ে আপনি সরাসরি জিতলেন ৳${winAmountBDT} টাকা ক্যাশ কুপন! এটি আপনার মূল ব্যালেন্স যুক্ত হয়েছে।`,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'bonus',
      actionTab: 'profile'
    };
    setNotifications(prev => [spinNotification, ...prev]);

    if (auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', spinTx.id), spinTx);
      } catch (err: any) {
        handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/transactions/${spinTx.id}`);
      }
    }
  };

  // Claim red envelope from hero banner click
  const handleRedEnvelopeClaim = async () => {
    if (!user) {
      setIsAuthActive({ active: true, tab: 'login' });
      return;
    }

    if (redEnvelopeClaimed) {
      alert('আপনি আজকের লাল খাম দাবি করেছেন! পরবর্তী বৃষ্টির জন্য অপেক্ষা করুন।');
      return;
    }

    // Award random envelope prize
    const luckyArray = [18, 58, 88, 168, 555];
    const envelopePrize = luckyArray[Math.floor(Math.random() * luckyArray.length)];

    const updatedProfile: UserProfile = {
      ...user,
      balance: user.balance + envelopePrize,
    };
    await saveUserData(updatedProfile);

    const envelopeTx: Transaction = {
      id: `TXN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      userId: user.uid,
      type: 'reward',
      amount: envelopePrize,
      status: 'success',
      createdAt: new Date().toLocaleTimeString('bn-BD'),
      description: 'লাল খাম মিষ্টি বৃষ্টি বোনাস জয়',
    };
    await saveTxnsData([envelopeTx, ...transactions]);

    // Create Red envelope notification
    const envNotification: UserNotification = {
      id: `notify-env-${Date.now()}`,
      title: `লাল খাম বৃষ্টি পুরস্কার ক্লেইম! 🧧`,
      description: `মেগা লাল খাম বৃষ্টিতে ক্লিক করে আপনি ওয়ান-ট্যাপ ক্লেইমে লুফে নিয়েছেন নিশ্চিত ৳${envelopePrize} সরাসরি উপহার বোনাস টাকা!`,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true }),
      isRead: false,
      type: 'bonus',
      actionTab: 'profile'
    };
    setNotifications(prev => [envNotification, ...prev]);

    if (auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', envelopeTx.id), envelopeTx);
      } catch (err: any) {
        handleDbError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/transactions/${envelopeTx.id}`);
      }
    }

    setRedEnvelopeClaimed(true);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3500);

    alert(`হুররে! আকাশছোঁয়া লাল খাম বৃষ্টি থেকে আপনি লুফে নিয়েছেন ৳${envelopePrize} টাকা ক্যাশ বোনাস! এটি সরাসরি ব্যালেন্স যুক্ত হয়েছে।`);
  };

  const handleGamePlayClick = (gItem: GameDefinition) => {
    if (!user) {
      setIsAuthActive({ active: true, tab: 'login' });
      return;
    }
    setActiveSlotGame(gItem);
  };

  // Filter games based on search query or category tabs selection
  const filteredGames = gamesList.filter(g => {
    const matchesQuery = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'hot' ? true : g.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans select-none relative pb-20 justify-start overflow-x-hidden">
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="fixed top-0 left-0 w-full h-[64px] bg-[#1E293B] border-b border-slate-700 flex items-center justify-between px-4 z-[1000] shadow-lg">
        {/* Left Actions & Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="cursor-pointer inline-block" onClick={() => { setActiveTab('home'); }}>
              <img 
                src={crbetLogo} 
                alt="CRBET666 Logo" 
                className="h-12 sm:h-14 w-auto max-w-[130px] sm:max-w-[150px] object-contain transition-all duration-200 hover:scale-[1.03] active:scale-95 mix-blend-screen drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 z-10">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Balance display widget card */}
              <div
                onClick={() => setActiveTab('profile')}
                className="bg-slate-900/50 hover:bg-slate-950/50 border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2 cursor-pointer shadow-inner transition-colors"
              >
                <div className="bg-yellow-500 text-slate-950 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  ৳
                </div>
                <span className="text-white text-xs font-bold font-sans">
                  ৳{user.balance.toLocaleString()}
                </span>
              </div>

              {/* Deposit Quick Trigger */}
              <button
                onClick={() => setActiveTab('deposit')}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full cursor-pointer shadow transition-all border border-yellow-400/15 hover:scale-[1.02] active:scale-95"
              >
                আমানত
              </button>

              {/* Notification icon log */}
              <button
                onClick={() => {
                  setActiveTab('notifications');
                }}
                className="relative text-slate-400 hover:text-white bg-slate-800 border border-slate-700 p-2 rounded-full cursor-pointer hover:bg-slate-750 transition-all"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Profile Shortcut */}
              <button
                onClick={() => setActiveTab('profile')}
                className="text-yellow-500 hover:scale-105 cursor-pointer bg-yellow-500/10 p-1.5 sm:p-2 rounded-xl transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-circle-user text-lg sm:text-xl"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthActive({ active: true, tab: 'login' })}
                className="text-yellow-500 bg-transparent hover:bg-yellow-500/5 text-xs font-bold py-2 px-3 rounded-lg transition-all cursor-pointer font-sans"
              >
                লগইন (LOGIN)
              </button>
              
              <button
                onClick={() => setIsAuthActive({ active: true, tab: 'register' })}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-extrabold py-2 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              >
                রেজিস্টার <i className="fa-solid fa-gift animate-bounce" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Confetti drop claims animations overlay */}
      {confettiActive && (
        <div className="fixed inset-0 z-[3000] pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="text-yellow-400 text-7xl animate-bounce">🪙✨👑✨🎉</div>
        </div>
      )}

      {/* Main Wrapper splitters */}
      <div className="w-full max-w-7xl mx-auto flex pt-[64px]">
        
        {/* A. FIXED LEFT SIDEBAR (DESKTOP MODE) */}
        <aside className="sidebar hidden md:flex w-[88px] bg-[#1E293B] border-r border-slate-700 flex-col items-center py-6 gap-6 shrink-0 fixed left-0 top-[64px] bottom-0 z-90 shadow-md">
          <button
            onClick={() => {
              setActiveTab('home');
              setActiveCategory('hot');
            }}
            className={`flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none w-full`}
          >
            <div className={`w-12 h-12 bg-gradient-to-tr from-orange-500 to-yellow-500 text-white rounded-full flex items-center justify-center shadow transition-all group-hover:scale-105`}>
              <i className="fa-solid fa-fire text-lg" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400">গরম (Hot)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('home');
              setActiveCategory('slot');
            }}
            className={`flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none w-full ${activeCategory === 'slot' ? 'text-yellow-500' : ''}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition-all group-hover:scale-105 border ${activeCategory === 'slot' ? 'border-yellow-500 bg-yellow-500/15 text-yellow-500' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <i className="fa-solid fa-7 text-xs" /><i className="fa-solid fa-7 text-xs" />
            </div>
            <span className={`text-[11px] font-semibold ${activeCategory === 'slot' ? 'text-white font-extrabold' : 'text-slate-400'}`}>স্লট (Slot)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('home');
              setActiveCategory('live');
            }}
            className={`flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none w-full ${activeCategory === 'live' ? 'text-yellow-500' : ''}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition-all group-hover:scale-105 border ${activeCategory === 'live' ? 'border-yellow-500 bg-yellow-500/15 text-yellow-500' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <i className="fa-solid fa-user-tie text-base" />
            </div>
            <span className={`text-[11px] font-semibold ${activeCategory === 'live' ? 'text-white' : 'text-slate-400'}`}>লাইভ ক্যাসিনো</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('home');
              setActiveCategory('fish');
            }}
            className={`flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none w-full ${activeCategory === 'fish' ? 'text-yellow-500' : ''}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition-all group-hover:scale-105 border ${activeCategory === 'fish' ? 'border-yellow-500 bg-yellow-500/15 text-yellow-500' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <i className="fa-solid fa-fish-fins text-base" />
            </div>
            <span className={`text-[11px] font-semibold ${activeCategory === 'fish' ? 'text-white' : 'text-slate-400'}`}>ফিশ শ্যুট</span>
          </button>
        </aside>

        {/* CONTAINER SCROLL VIEW CHANNELS */}
        <main className="flex-1 w-full p-4 md:ml-[88px] space-y-4">
          
          <AnimatePresence mode="wait">
            {/* LOBBY PAGE */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                
                {/* 1. HERO SLIDER BANNER CARD */}
                <section
                  id="promo-slider"
                  onMouseEnter={() => setIsSliderHovered(true)}
                  onMouseLeave={() => setIsSliderHovered(false)}
                  className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-[#151D30] group select-none min-h-[155px] sm:min-h-[175px] md:min-h-[215px] lg:min-h-[255px] transition-all flex items-stretch cursor-default"
                >
                  {/* Sliding carousel background card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      {/* background image fit with fallbacks */}
                      <img
                        src={PROMO_SLIDES[currentSlide].image}
                        alt={PROMO_SLIDES[currentSlide].title}
                        className="w-full h-full object-cover select-none pointer-events-none opacity-85"
                        referrerPolicy="no-referrer"
                      />
                      {/* Gradient overlay to ensure text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/60 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Slide Content Overlay */}
                  <div className="relative z-20 flex-1 flex items-end justify-between p-4 sm:p-5 md:p-6 lg:p-8 text-left">
                    <div className="flex flex-row items-center justify-between w-full gap-4 sm:gap-6">
                      {/* Top item: badge tag */}
                      <div className="space-y-1 sm:space-y-1.5 md:space-y-2 max-w-[65%] sm:max-w-[70%] md:max-w-[75%] flex flex-col items-start text-left">
                        <span className="inline-block text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider bg-red-600/90 text-white rounded-full px-2 sm:px-2.5 py-0.5 shadow-sm font-sans">
                          {PROMO_SLIDES[currentSlide].badge}
                        </span>
                        <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-extrabold text-white tracking-wide leading-tight select-none drop-shadow-md">
                          {PROMO_SLIDES[currentSlide].title}
                        </h2>
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-250 leading-snug drop-shadow max-w-xl font-medium">
                          {PROMO_SLIDES[currentSlide].desc}
                        </p>
                      </div>

                      {/* Bottom CTA Button */}
                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <button
                          onClick={() => handlePromoSlideClick(PROMO_SLIDES[currentSlide].action)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-[10px] sm:text-xs md:text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-full cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 border border-yellow-400 hover:scale-[1.03] active:scale-95 transition-all duration-150 inline-flex items-center gap-1.5 tracking-wide"
                        >
                          {PROMO_SLIDES[currentSlide].btnText}
                          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Left / Right Interactive Arrow Keys */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(prev => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 border border-slate-700/50 hover:bg-yellow-500 hover:border-yellow-400 hover:text-slate-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md focus:outline-none"
                    aria-label="Previous Slide"
                  >
                    <i className="fa-solid fa-angle-left text-xs sm:text-sm" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(prev => (prev + 1) % PROMO_SLIDES.length);
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 border border-slate-700/50 hover:bg-yellow-500 hover:border-yellow-400 hover:text-slate-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md focus:outline-none"
                    aria-label="Next Slide"
                  >
                    <i className="fa-solid fa-angle-right text-xs sm:text-sm" />
                  </button>

                  {/* Indicators Pagination Dots */}
                  <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
                    {PROMO_SLIDES.map((slide, index) => (
                      <button
                        key={slide.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(index);
                        }}
                        className={`h-1.5 transition-all duration-200 rounded-full cursor-pointer focus:outline-none ${index === currentSlide ? 'w-4 sm:w-5 bg-yellow-500 shadow shadow-yellow-500/50' : 'w-1.5 bg-slate-500/70 hover:bg-slate-300'}`}
                        title={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </section>

                {/* 2. LIVE MARQUEE NEWS STREAMER */}
                <div className="bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 flex items-center gap-3 text-xs shadow-sm overflow-hidden">
                  <Volume2 className="w-4 h-4 text-yellow-500 animate-bounce cursor-pointer shrink-0" />
                  <div className="relative flex-1 overflow-hidden h-5">
                    <marquee className="text-slate-300 font-medium font-sans">
                      🔥 মন্ত্রীরা ১৮ টাকা পাবেন 🔥 ১৬৮ টাকা বোনাস পেতে এখনই ফার্স্ট ডিপোজিট করুন... মেগা স্লট মেম্বারদের জন্য ২৫% ক্যাশ ব্যাক গ্যারান্টি!
                    </marquee>
                  </div>
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0"
                      title="লগআউট"
                    >
                      <i className="fa-solid fa-right-from-bracket text-[10px]"></i>
                    </button>
                  )}
                </div>

                {/* 3. QUICK ACTION DIRECTORIES ACCENTS */}
                <nav className="grid grid-cols-5 gap-2 text-center select-none font-sans">
                  
                  <button
                    onClick={handleDailyCheckIn}
                    className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
                  >
                    <div className="w-13 h-13 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow shadow-red-500/10 group-hover:scale-105 transition-transform text-white">
                      <CalendarCheck className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">সাইন ইন</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!user) {
                        setIsAuthActive({ active: true, tab: 'login' });
                        return;
                      }
                      setIsSpinActive(true);
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group animate-wiggle"
                  >
                    <div className="w-13 h-13 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow shadow-orange-500/10 group-hover:scale-105 transition-transform text-slate-950">
                      <i className="fa-solid fa-dharmachakra text-xl animate-spin-slow text-slate-900" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">স্পিন</span>
                  </button>

                  <button
                    onClick={() => {
                      if (user) {
                        setActiveTab('profile');
                      } else {
                        setIsAuthActive({ active: true, tab: 'login' });
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
                  >
                    <div className="w-13 h-13 bg-yellow-500 text-slate-950 rounded-2xl flex items-center justify-center shadow shadow-yellow-500/15 group-hover:scale-105 transition-transform font-bold">
                      <Coins className="w-6 h-6 text-slate-900" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">ক্যাশ ব্যাক</span>
                  </button>

                  <button
                    onClick={() => {
                      if (user) {
                        setActiveTab('profile');
                      } else {
                        alert("অনুগ্রহ করে আপনার লেভেল দেখতে আগে লগইন করুন!");
                        setIsAuthActive({ active: true, tab: 'login' });
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
                  >
                    <div className="w-13 h-13 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow shadow-purple-500/10 group-hover:scale-105 transition-transform text-white">
                      <Crown className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 font-sans">VIP</span>
                  </button>

                  <button
                    onClick={() => {
                      alert("প্রমোশনাল অফার সেন্টার:\nপ্রথম বিকাশে ডিপোজিট করলে পাচ্ছেন ১৬৮ টাকা ইনস্ট্যান্ট কুপন বোনাস!");
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
                  >
                    <div className="w-13 h-13 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow shadow-pink-500/10 group-hover:scale-105 transition-transform text-white">
                      <Gift className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">বোনাস</span>
                  </button>

                </nav>

                {/* 4. GAME FILTER AND SEARCH BOX */}
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="গেম বা প্রোভাইডার অনুসন্ধান করুন..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1E293B] border border-slate-700 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 placeholder:text-slate-500 text-white focus:outline-none focus:border-yellow-500 shadow-md font-sans"
                    />
                  </div>

                  {/* Hot, Slot, Live category sliders on mobile layouts */}
                  <div className="flex md:hidden bg-[#1E293B] p-1.5 border border-slate-700 rounded-xl text-xs">
                    {(['hot', 'slot', 'live', 'fish'] as const).map(catName => (
                      <button
                        key={catName}
                        onClick={() => setActiveCategory(catName)}
                        className={`flex-1 py-1.5 font-bold rounded-lg ${
                          activeCategory === catName
                            ? 'bg-yellow-500 text-slate-950 shadow font-extrabold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {catName === 'hot' ? 'গরম' : catName === 'slot' ? 'স্লট' : catName === 'live' ? 'লাইভ' : 'ফিশ শ্যুট'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. GIGANTIC MAIN GAME SECTION CARD VIEWS */}
                <section className="space-y-3 text-sans">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-yellow-500" /> 
                      {activeCategory === 'hot' ? 'জনপ্রিয় গেম সমূহ' : activeCategory === 'slot' ? 'স্লট গেম প্রোভাইডার্স' : activeCategory === 'live' ? 'লাইভ ক্যাসিনো স্যুইট' : 'আকেড ফিশ হান্ট'}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-sans">ফলাফল: {filteredGames.length}টি গেম</span>
                  </div>

                  {filteredGames.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs bg-[#1E293B] rounded-2xl border border-slate-700">
                      কোনো উপযুক্ত ক্যাসিনো গেম খুঁজে পাওয়া যায়নি!
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                      {filteredGames.map(gameItem => {
                        return (
                          <div
                            key={gameItem.id}
                            className="bg-[#1E293B] border border-slate-700 hover:border-yellow-500/50 rounded-xl overflow-hidden shadow-lg flex flex-col group transition-all transform active:scale-95 cursor-pointer pb-2 text-sans"
                            onClick={() => handleGamePlayClick(gameItem)}
                          >
                            {/* Graphic Header card layout */}
                            <div
                              className="w-full aspect-square relative flex flex-col items-center justify-center shrink-0 border-b border-slate-700 bg-slate-800 overflow-hidden"
                            >
                              {gameItem.imageUrl.startsWith('/') ? (
                                <img 
                                  src={gameItem.imageUrl} 
                                  alt={gameItem.title} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full" style={{ background: gameItem.imageUrl }} />
                              )}
                              
                              <span className="absolute top-2.5 right-2.5 text-yellow-400 bg-slate-900/80 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] shadow border border-slate-700 hover:border-yellow-500 z-10">
                                <i className="fa-solid fa-star text-[9px]" />
                              </span>
                              
                              <span className="absolute bottom-0 right-0 bg-yellow-500 text-slate-950 font-extrabold text-[8px] font-sans px-2 py-0.5 rounded-tl-lg shadow uppercase z-10">
                                {gameItem.provider}
                              </span>
                            </div>

                            {/* Game Title info */}
                            <div className="px-2 pt-2 text-center text-sans">
                              <p className="game-title text-xs font-bold text-white tracking-wide truncate">
                                {gameItem.title}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* DEDICATED DEPOSIT PAGE REPLICATED FROM SCREENSHOT */}
            {activeTab === 'deposit' && (
              <motion.div key="depositTab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                {user ? (
                  <DepositPage
                    user={user}
                    onDeposit={handleDepositRequest}
                    onBack={() => setActiveTab('home')}
                    onNavigateToTab={(tabName) => setActiveTab(tabName)}
                  />
                ) : (
                  <div className="bg-[#1E293B] border border-slate-700 p-8 text-center rounded-2xl max-w-sm mx-auto space-y-4 shadow-xl text-sans">
                    <div className="text-yellow-500 text-4xl">🔒</div>
                    <h3 className="font-bold text-base text-yellow-500">আমানত করতে আপনার একাউন্ট লগইন করুন</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">ডিপোজিট রেকর্ড সেট করতে প্রথমে নিবন্ধন অথবা ডেমো অ্যাকাউন্ট প্লে অপশন নির্বাচন করুন।</p>
                    <button
                      type="button"
                      onClick={() => setIsAuthActive({ active: true, tab: 'login' })}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow focus:outline-none transition-colors"
                    >
                      লগইন ফর্ম খুলুন
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* INVITATION LINK SYSTEM */}
            {activeTab === 'invite' && (
              <motion.div
                key="inviteTab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto bg-[#1E293B] border border-slate-700 rounded-[22px] p-5 text-sans space-y-5 shadow-xl"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-slate-950">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-yellow-500 uppercase font-sans">রেফার করে টাকা আয় করুন!</h3>
                  <p className="text-xs text-slate-400 font-semibold text-center leading-relaxed">আপনার বন্ধুদের আমন্ত্রণ জানিয়ে পান আকর্ষণীয় কমিশন ও আনলিমিটেড ক্যাশ রিওয়ার্ড কুপন।</p>
                </div>

                <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">আমার রেফারেল লিংক:</span>
                    <span className="text-yellow-500 font-bold font-sans">৳ ১০০ বোনাস প্রতি সফল রেফারেলে</span>
                  </div>
                  
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center font-mono text-xs text-slate-300 font-semibold select-all cursor-pointer">
                    https://crbet666.com/reg?ref={user ? user.referralCode : 'CRB666'}
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        alert("লিংক কপি সফল হয়েছে! আপনার বন্ধুদের মেসেঞ্জারে বা হোয়াটসঅ্যাপে শেয়ার করুন।");
                      }}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-200 border border-slate-700 rounded-lg font-bold cursor-pointer transition-all focus:outline-none"
                    >
                      লিংক কপি করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert("আমাদের টেলিগ্রাম মেগা কমিউনিটিতে যুক্ত হয়ে রেফারেলে ক্যাশ নিতে পারেন!");
                      }}
                      className="flex-1 py-2.5 bg-yellow-500 text-slate-950 rounded-lg font-bold cursor-pointer transition-all focus:outline-none hover:bg-yellow-600"
                    >
                      টেলিগ্রামে শেয়ার
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 leading-relaxed font-sans">
                  <h4 className="font-bold text-slate-300 flex items-center gap-1.5 pb-1">
                    <i className="fa-solid fa-circle-info text-yellow-500" /> রেফারেল কমিশনের নিয়মাবলি:
                  </h4>
                  <p>• প্রতিটি আমন্ত্রিত বন্ধু প্রথমবার ডিপোজিট করলে আপনি পাবেন ৳১০০ সরাসরি বোনাস টাকা।</p>
                  <p>• দ্বিতীয় স্তরের রেফারেলদের প্রতিদিনের স্লট ম্যাচিং লস থেকে ১.৫% ডেইলি ইনকাম শেয়ারিং পেমেন্ট!</p>
                  <p>• রেফার সংখ্যা ৫ জনের বেশি হলে মেগা উইকলি লিডারবোর্ডে অতিরিক্ত বোনাস পুল দাবি করা যায়।</p>
                </div>
              </motion.div>
            )}

            {/* PROMOTIONS BOARD */}
            {activeTab === 'promotion' && (
              <motion.div
                key="promotions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto space-y-3"
              >
                <div className="bg-[#1E293B] border border-slate-700 p-4 rounded-xl text-sans space-y-2 shadow-sm font-sans">
                  <div className="bg-red-600 font-extrabold uppercase text-white px-2 py-0.5 rounded text-[10px] inline-block mb-1">ফাস্ট ডিপোজিট প্রমো</div>
                  <h3 className="font-extrabold text-white text-base">১০০ টাকা ডিপোজিটে পান ১৬৮ BDT সরাসরি ফ্রি!</h3>
                  <p className="text-xs text-slate-300">বিকাশ নগদ ব্যবহার করে প্রথমবার আমানত করলেই কুপন যুক্ত হবে প্রোফাইলে।</p>
                </div>

                <div className="bg-[#1E293B] border border-slate-700 p-4 rounded-xl text-sans space-y-2 shadow-sm font-sans">
                  <div className="bg-yellow-500 font-extrabold uppercase text-slate-[#0F172A] px-2 py-0.5 rounded text-[10px] inline-block mb-1">স্লট ক্যাশব্যাক গ্যারান্টি</div>
                  <h3 className="font-extrabold text-[#F8FAFC] text-base">স্লট খেলায় পাবেন ১.২% লিমিটলেস দৈনিক টার্নওভার পেমেন্ট!</h3>
                  <p className="text-xs text-slate-400">কোনো রুলস ছাড়াই প্রতিদিন রাত ১২ টায় আপনার ব্যালেন্স এ যুক্ত হবে ক্যাশব্যাক বোনাস।</p>
                </div>

                <div className="bg-[#1E293B] border border-slate-700 p-4 rounded-xl text-sans space-y-2 shadow-sm font-sans">
                  <div className="bg-purple-500 font-extrabold uppercase text-white px-2 py-0.5 rounded text-[10px] inline-block mb-1">ভিআইপি রিওয়ার্ড বোনাস</div>
                  <h3 className="font-extrabold text-[#F8FAFC] text-base">VIP ৩ গোল্ড মেম্বারদের জন্য রয়েছে সাপ্তাহিক ফ্রিতে প্রাইজ স্পিন!</h3>
                  <p className="text-xs text-slate-400 font-medium">ডিপোজিট করুন ও আপনার VIP অগ্রগতির চাকা আরও দ্রুত ত্বরান্বিত করুন।</p>
                </div>
              </motion.div>
            )}

            {/* MEMBER PROFILE TAB ROUTER */}
            {activeTab === 'profile' && (
              <motion.div key="profileTab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {user ? (
                  <UserProfilePanel
                    user={user}
                    transactions={transactions}
                    betHistory={betHistory}
                    onDeposit={handleDepositRequest}
                    onWithdraw={handleWithdrawalRequest}
                    onBack={() => setActiveTab('home')}
                    onNavigateToTab={(tabName) => {
                      if (tabName === 'spin') {
                        setIsSpinActive(true);
                        return;
                      }
                      setActiveTab(tabName);
                    }}
                    onSignInClaim={handleDailyCheckIn}
                    onLogout={() => {
                      handleLogout();
                      setActiveTab('home');
                    }}
                  />
                ) : (
                  <div className="bg-[#1E293B] border border-slate-700 p-8 text-center rounded-2xl max-w-sm mx-auto space-y-4 shadow-xl">
                    <div className="text-yellow-500 text-4xl">🔒</div>
                    <h3 className="font-extrabold text-[#F8FAFC] text-base font-sans text-yellow-500">মেম্বার প্যানেল খুলতে লগইন করুন</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">আপনার সঠিক বিডি ব্যালেন্স, কুপন গিফটস এবং পেমেন্ট উইথড্রল রেকর্ড পরিচালনা করতে নিচে লগইন করুন।</p>
                    <button
                      type="button"
                      onClick={() => setIsAuthActive({ active: true, tab: 'login' })}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow focus:outline-none transition-colors"
                    >
                      লগইন করুন
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* DEDICATED ACCOUNT LIVE TRACKER PAGE */}
            {activeTab === 'account' && (
              <motion.div key="accountTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
                <AccountTrackerPage
                  user={user}
                  transactions={transactions}
                  betHistory={betHistory}
                  onBack={() => setActiveTab('home')}
                  onNavigateToTab={(tabName) => setActiveTab(tabName)}
                  onOpenAuth={(tab) => setIsAuthActive({ active: true, tab })}
                  jackpotPool={jackpotPool}
                />
              </motion.div>
            )}

            {/* USER NOTIFICATIONS INBOX PAGE */}
            {activeTab === 'notifications' && (
              <motion.div key="notificationsTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
                <NotificationsPage
                  notifications={notifications}
                  onMarkAllAsRead={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  }}
                  onMarkAsRead={(id) => {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                  }}
                  onDeleteNotification={(id) => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                  }}
                  onClearAll={() => {
                    setNotifications([]);
                  }}
                  onBack={() => setActiveTab('home')}
                  onNavigateToTab={(tabName) => setActiveTab(tabName)}
                />
              </motion.div>
            )}

          </AnimatePresence>

          {/* SITE CONTENT FOOTER */}
          <footer id="main-portal-footer" className="mt-8 bg-[#111827]/85 rounded-2xl border border-slate-800 p-6 space-y-6 text-sans">
            {/* Top row: Brand summary, partners, and profile tracker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-base">CR</span>
                  <span className="font-extrabold text-[#F8FAFC] tracking-wider text-sm uppercase">CRBet Bangladesh</span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans mt-1">
                  সিআরবেট (CRBet) দক্ষিণ এশিয়ার সবচেয়ে নিরাপদ ও নির্ভরযোগ্য গেমিং প্ল্যাটফর্ম। আমরা কুরাসাও গেমিং লাইসেন্স (Curacao eGaming License No. 1668/JAZ) এর অধীনে নিবন্ধিত এবং আন্তর্জাতিক মান অনুযায়ী ফেয়ার-প্লে গ্যারান্টি দিয়ে থাকি।
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-slate-900 border border-slate-800 text-yellow-500 text-[10px] uppercase px-2 py-0.5 rounded font-extrabold tracking-wider">
                    Curacao Licensed
                  </span>
                  <span className="bg-slate-900 border border-slate-800 text-red-400 text-[10px] px-2 py-0.5 rounded font-bold font-sans">
                    🔞 18+ Responsible
                  </span>
                  <span className="bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold font-sans">
                    ✓ SSL Secured
                  </span>
                </div>
              </div>

              {/* Game Category partners list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-handshake text-yellow-500" /> অফিশিয়াল গেম পার্টনার্স
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold text-slate-400 font-sans">
                  <span className="bg-[#1E293B] border border-slate-800 py-2 rounded hover:text-white transition-colors cursor-default">PG SOFT</span>
                  <span className="bg-[#1E293B] border border-slate-800 py-2 rounded hover:text-white transition-colors cursor-default">JILI GAMES</span>
                  <span className="bg-[#1E293B] border border-slate-800 py-2 rounded hover:text-white transition-colors cursor-default">PRAGMATIC</span>
                  <span className="bg-[#1E293B] border border-slate-800 py-2 rounded hover:text-white transition-colors cursor-default">SPRIBE AVIATOR</span>
                  <span className="bg-[#1E293B] border border-slate-800 py-2 rounded hover:text-white transition-colors cursor-default">EVOLUTION</span>
                  <span className="bg-[#1E293B] border border-slate-800 py-2 rounded hover:text-white transition-colors cursor-default">KINGMAKER</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Bottom Row: Disclaimer and Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-sans font-medium text-center md:text-left">
              <div className="space-y-1">
                <p>© 2026 CRBet Corporation. All Rights Reserved. (v2.4.0-Stable)</p>
                <p className="max-w-xl text-[9px] text-slate-600 leading-normal">
                  সতর্কতা: জুয়া আসক্তিমূলক হতে পারে। দয়া করে আপনার অর্থনৈতিক সামর্থ্য অনুযায়ী খেলুন। যেকোনো সহযোগিতার জন্য আমাদের ২৪/৭ কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন।
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setFooterModal({
                    isOpen: true,
                    title: 'খেলার সাধারণ নিয়মাবলি ও ফেয়ার-প্লে',
                    icon: 'fa-solid fa-gamepad text-yellow-500',
                    content: 'সিআরবেট (CRBet) প্ল্যাটফর্মের সব গেম সম্পূর্ণরূপে লাইভ এবং আরএনজি (RNG) সার্টিফাইড। কোনো প্রকারের কারচুপি বা ফলাফল নিয়ন্ত্রণ সম্পূর্ণ অসম্ভব এবং ফেয়ার-প্লে আইনত নিশ্চিত করা হয়। আমরা গ্রাহকের নিরাপত্তা এবং স্বচ্ছ গেমিং অভিজ্ঞতায় বিশ্বাস করি। যেকোনো বেটের ফলাফল সরাসরি গেম ইঞ্জিনের দ্বারা নির্ধারিত হয়ে থাকে এবং লাইভ ট্র্যাকিং সিস্টেমে যাচাই করা যায়।'
                  })}
                  className="hover:text-yellow-500 transition-colors cursor-pointer font-bold text-[10px] bg-transparent border-none p-0 outline-none"
                >
                  খেলার নিয়ম
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setFooterModal({
                    isOpen: true,
                    title: '২৪/৭ কাস্টমার লাইভ সাপোর্ট',
                    icon: 'fa-solid fa-headset text-emerald-400',
                    content: 'আমাদের ২৪/৭ কাস্টমার সাপোর্ট টিম সবসময় সক্রিয় রয়েছে। ডিপোজিট, উইথড্র কিংবা যেকোনো ক্যাসিনো গেম খেলা নিয়ে কোনো সমস্যা বা জিজ্ঞাসা থাকলে সরাসরি আমাদের অফিশিয়াল টেলিগ্রাম চ্যানেল কিংবা অ্যাপ্লিকেশনের লাইভ চ্যাট বক্সে যোগাযোগ করুন। আমরা অতি দ্রুত votre সমস্যার চমৎকার সমাধান দিতে বদ্ধপরিকর।'
                  })}
                  className="hover:text-yellow-500 transition-colors cursor-pointer font-bold text-[10px] bg-transparent border-none p-0 outline-none"
                >
                  লাইভ সাপোর্ট
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setFooterModal({
                    isOpen: true,
                    title: 'গোপনীয়তা ও সিকিউরিটি পলিসি',
                    icon: 'fa-solid fa-shield-halved text-indigo-400',
                    content: 'সিআরবেট (CRBet) গ্রাহকদের সকল ব্যক্তিগত তথ্য, একাউন্ট ব্যালেন্স এবং ট্রানজেকশন স্টেটমেন্টের সুরক্ষা নিশ্চিত করে। আমাদের ডেটাবেস ও নেটওয়ার্ক ট্রাফিকের সুরক্ষায় মিলিটারি গ্রেড AES-256 এনক্রিপশন প্রোটোকল ব্যবহৃত হচ্ছে। থার্ড-পার্টি বা বাইরের কারো কাছে গ্রাহকের আইডেন্টিটি বা প্রোফাইলের কোনো তথ্য কখনোই শেয়ার বা প্রকাশ করা হয় না।'
                  })}
                  className="hover:text-yellow-500 transition-colors cursor-pointer font-bold text-[10px] bg-transparent border-none p-0 outline-none"
                >
                  গোপনীয়তা নীতি
                </button>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* 2. BOTTOM MOBILE NAVIGATION BAR */}
      <footer className="fixed bottom-0 left-0 w-full h-[72px] bg-[#21272d] border-t border-[#2d3641] flex items-center justify-around pb-1.5 z-[1000] shadow-xl md:hidden">
        
        <button
          onClick={() => {
            setActiveTab('home');
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-[#00b986]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-house text-lg" />
          <span className="text-[10px] font-bold">হোম</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('deposit');
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none cursor-pointer transition-colors ${
            activeTab === 'deposit' ? 'text-[#00b986]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-wallet text-lg" />
          <span className="text-[10px] font-bold">আমানত</span>
        </button>

        {/* Floating Glowing invite center button */}
        <button
          onClick={() => {
            setActiveTab('invite');
          }}
          className="relative top-[-14px] flex flex-col items-center gap-1 focus:outline-none cursor-pointer group"
        >
          <div className="w-[50px] h-[50px] bg-gradient-to-tr from-[#f1b80d] to-[#e17055] rounded-full flex items-center justify-center shadow-lg border-4 border-[#21272d] group-hover:scale-105 transition-transform text-white">
            <i className="fa-solid fa-gift text-lg animate-pulse" />
          </div>
          <span className="text-[10px] text-gray-400 font-bold tracking-wide mt-1">আমন্ত্রণ</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('promotion');
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none cursor-pointer transition-colors ${
            activeTab === 'promotion' ? 'text-[#00b986]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-bullhorn text-lg animate-wiggle" />
          <span className="text-[10px] font-bold">প্রচার</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none cursor-pointer transition-colors ${
            activeTab === 'profile' ? 'text-[#00b986]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-user-gear text-lg" />
          <span className="text-[10px] font-bold">সদস্য</span>
        </button>

      </footer>

      {/* --- ALL CONDITIONAL OVERLAYS AND PROMPT MODALS --- */}
      
      {/* 1. SLOT GAME MACHINE OVERLAY MODAL */}
      <AnimatePresence>
        {activeSlotGame && user && (
          <SlotMachineModal
            game={activeSlotGame}
            user={user}
            onBetPlaced={handleBetPlacedResult}
            onClose={() => setActiveSlotGame(null)}
          />
        )}
      </AnimatePresence>

      {/* 2. PRIZE SPINNER SPIN WHEEL MODAL */}
      <AnimatePresence>
        {isSpinActive && user && (
          <SpinWheelModal
            user={user}
            onSpinWin={handleSpinResultWin}
            onClose={() => setIsSpinActive(false)}
          />
        )}
      </AnimatePresence>

      {/* 3. USER AUTH REGISTER LOGIN MODAL */}
      <AnimatePresence>
        {isAuthActive.active && (
          <AuthModal
            initialTab={isAuthActive.tab}
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setIsAuthActive({ active: false, tab: 'login' })}
          />
        )}
      </AnimatePresence>

      {/* 4. SITE FOOTER INFORMATION MODAL */}
      <AnimatePresence>
        {footerModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-2xl relative space-y-4 text-sans"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center">
                  <i className={footerModal.icon} />
                </div>
                <h3 className="font-extrabold text-[#F8FAFC] text-base">{footerModal.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium bg-slate-950/40 border border-slate-800/40 rounded-xl p-4">
                {footerModal.content}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFooterModal({ isOpen: false, title: '', content: '', icon: '' })}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98] text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer shadow focus:outline-none transition-all"
                >
                  ঠিক আছে
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
