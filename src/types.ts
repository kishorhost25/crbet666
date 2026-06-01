export interface UserProfile {
  uid: string;
  username: string;
  balance: number;
  bonusBalance: number;
  vipLevel: number;
  totalDeposits: number;
  totalBets: number;
  isGuest: boolean;
  createdAt: string;
  lastCheckIn: string | null;
  spinsCount: number;
  photoUrl?: string;
  referralCode: string;
  referredBy?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'reward' | 'bet_win' | 'bet_loss' | 'spin_win';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  paymentMethod?: 'bkash' | 'nagad' | 'rocket';
  accountNo?: string;
  txnId?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  description: string;
}

export interface BetRecord {
  id: string;
  userId: string;
  gameId: string;
  gameTitle: string;
  betAmount: number;
  winAmount: number;
  payoutMultiplier: number;
  result: 'win' | 'loss';
  createdAt: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  category: 'slot' | 'live' | 'fish' | 'hot';
  provider: string;
  imageUrl: string;
  isFavorite?: boolean;
}

export interface JackpotWinner {
  username: string;
  amount: number;
  time: string;
  game: string;
}

export interface UserNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  type: 'system' | 'bonus' | 'payment' | 'game' | 'vip';
  actionTab?: 'home' | 'deposit' | 'invite' | 'promotion' | 'profile' | 'account';
}

