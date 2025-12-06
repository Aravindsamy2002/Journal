import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TradeDirection = 'buy' | 'sell';
export type AccountType = 'real' | 'demo' | 'funded' | 'challenge';
export type Session = 'asia' | 'london' | 'newyork';
export type MarketType = 'forex' | 'crypto' | 'indices' | 'commodities';
export type TradeResult = 'win' | 'loss' | 'breakeven';

export interface Trade {
  id: string;
  date: string;
  pair: string;
  direction: TradeDirection;
  accountType: AccountType;
  session: Session;
  marketType: MarketType;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice: number;
  positionSize: number;
  riskAmount: number;
  riskPercent: number;
  lotSize: number;
  rrr: number;
  pnlAmount: number;
  pnlPercent: number;
  pipGain: number;
  setupTag: string;
  emotionTags: string[];
  notes: string;
  observations: string;
  mistakes: string;
  lessons: string;
  screenshots: string[];
  result: TradeResult;
  createdAt: string;
  updatedAt: string;
}

interface TradeStore {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  duplicateTrade: (id: string) => void;
  getTrade: (id: string) => Trade | undefined;
  getFilteredTrades: (filters: TradeFilters) => Trade[];
}

export interface TradeFilters {
  dateFrom?: string;
  dateTo?: string;
  pair?: string;
  session?: Session;
  result?: TradeResult;
  marketType?: MarketType;
  accountType?: AccountType;
  setupTag?: string;
  searchQuery?: string;
}

const generateId = () => `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock data for demonstration
const mockTrades: Trade[] = [
  {
    id: generateId(),
    date: '2024-12-01',
    pair: 'XAUUSD',
    direction: 'buy',
    accountType: 'funded',
    session: 'london',
    marketType: 'commodities',
    entryPrice: 2650.50,
    stopLoss: 2645.00,
    takeProfit: 2665.00,
    exitPrice: 2663.20,
    positionSize: 1000,
    riskAmount: 55,
    riskPercent: 1,
    lotSize: 0.1,
    rrr: 2.31,
    pnlAmount: 127,
    pnlPercent: 2.31,
    pipGain: 127,
    setupTag: 'SMC',
    emotionTags: [],
    notes: 'Clean order block entry with London session momentum',
    observations: 'Price respected the 4H order block perfectly',
    mistakes: 'None',
    lessons: 'Trust the setup when all confluences align',
    screenshots: [],
    result: 'win',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z',
  },
  {
    id: generateId(),
    date: '2024-12-02',
    pair: 'EURUSD',
    direction: 'sell',
    accountType: 'funded',
    session: 'newyork',
    marketType: 'forex',
    entryPrice: 1.0520,
    stopLoss: 1.0545,
    takeProfit: 1.0470,
    exitPrice: 1.0540,
    positionSize: 10000,
    riskAmount: 25,
    riskPercent: 0.5,
    lotSize: 0.1,
    rrr: -0.8,
    pnlAmount: -20,
    pnlPercent: -0.4,
    pipGain: -20,
    setupTag: 'Breakout',
    emotionTags: ['FOMO'],
    notes: 'Entered too early on a false breakout',
    observations: 'Should have waited for NY session confirmation',
    mistakes: 'Entered before confirmation, FOMO trade',
    lessons: 'Wait for proper breakout confirmation',
    screenshots: [],
    result: 'loss',
    createdAt: '2024-12-02T15:00:00Z',
    updatedAt: '2024-12-02T17:30:00Z',
  },
  {
    id: generateId(),
    date: '2024-12-03',
    pair: 'GBPJPY',
    direction: 'buy',
    accountType: 'funded',
    session: 'london',
    marketType: 'forex',
    entryPrice: 188.50,
    stopLoss: 188.00,
    takeProfit: 190.00,
    exitPrice: 189.85,
    positionSize: 5000,
    riskAmount: 25,
    riskPercent: 0.5,
    lotSize: 0.05,
    rrr: 2.7,
    pnlAmount: 67.5,
    pnlPercent: 1.35,
    pipGain: 135,
    setupTag: 'FVG',
    emotionTags: [],
    notes: 'Fair value gap fill with trend continuation',
    observations: 'Perfect entry on the FVG with strong momentum',
    mistakes: 'None',
    lessons: 'FVG entries during trend continuation are high probability',
    screenshots: [],
    result: 'win',
    createdAt: '2024-12-03T09:00:00Z',
    updatedAt: '2024-12-03T13:00:00Z',
  },
  {
    id: generateId(),
    date: '2024-12-04',
    pair: 'BTCUSD',
    direction: 'buy',
    accountType: 'real',
    session: 'asia',
    marketType: 'crypto',
    entryPrice: 42500,
    stopLoss: 41800,
    takeProfit: 44000,
    exitPrice: 43800,
    positionSize: 0.5,
    riskAmount: 350,
    riskPercent: 2,
    lotSize: 0.5,
    rrr: 1.86,
    pnlAmount: 650,
    pnlPercent: 3.05,
    pipGain: 1300,
    setupTag: 'Liquidity Grab',
    emotionTags: [],
    notes: 'Liquidity sweep below the range with strong reversal',
    observations: 'Clear liquidity grab pattern',
    mistakes: 'Could have held for full TP',
    lessons: 'Trust the setup for full target',
    screenshots: [],
    result: 'win',
    createdAt: '2024-12-04T03:00:00Z',
    updatedAt: '2024-12-04T08:00:00Z',
  },
  {
    id: generateId(),
    date: '2024-12-05',
    pair: 'NAS100',
    direction: 'sell',
    accountType: 'funded',
    session: 'newyork',
    marketType: 'indices',
    entryPrice: 16850,
    stopLoss: 16920,
    takeProfit: 16700,
    exitPrice: 16720,
    positionSize: 2,
    riskAmount: 140,
    riskPercent: 1,
    lotSize: 2,
    rrr: 1.86,
    pnlAmount: 260,
    pnlPercent: 1.86,
    pipGain: 130,
    setupTag: 'Trend Continuation',
    emotionTags: [],
    notes: 'Trend continuation after pullback to supply zone',
    observations: 'Strong rejection from supply zone',
    mistakes: 'None',
    lessons: 'Supply zones in downtrend are reliable',
    screenshots: [],
    result: 'win',
    createdAt: '2024-12-05T14:00:00Z',
    updatedAt: '2024-12-05T18:00:00Z',
  },
];

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: mockTrades,
      
      addTrade: (trade) => {
        const newTrade: Trade = {
          ...trade,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ trades: [newTrade, ...state.trades] }));
      },
      
      updateTrade: (id, updates) => {
        set((state) => ({
          trades: state.trades.map((trade) =>
            trade.id === id
              ? { ...trade, ...updates, updatedAt: new Date().toISOString() }
              : trade
          ),
        }));
      },
      
      deleteTrade: (id) => {
        set((state) => ({
          trades: state.trades.filter((trade) => trade.id !== id),
        }));
      },
      
      duplicateTrade: (id) => {
        const trade = get().trades.find((t) => t.id === id);
        if (trade) {
          const newTrade: Trade = {
            ...trade,
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ trades: [newTrade, ...state.trades] }));
        }
      },
      
      getTrade: (id) => {
        return get().trades.find((trade) => trade.id === id);
      },
      
      getFilteredTrades: (filters) => {
        let filteredTrades = [...get().trades];
        
        if (filters.dateFrom) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.date >= filters.dateFrom!
          );
        }
        
        if (filters.dateTo) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.date <= filters.dateTo!
          );
        }
        
        if (filters.pair) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.pair.toLowerCase().includes(filters.pair!.toLowerCase())
          );
        }
        
        if (filters.session) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.session === filters.session
          );
        }
        
        if (filters.result) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.result === filters.result
          );
        }
        
        if (filters.marketType) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.marketType === filters.marketType
          );
        }
        
        if (filters.accountType) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.accountType === filters.accountType
          );
        }
        
        if (filters.setupTag) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.setupTag === filters.setupTag
          );
        }
        
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredTrades = filteredTrades.filter(
            (trade) =>
              trade.pair.toLowerCase().includes(query) ||
              trade.notes.toLowerCase().includes(query) ||
              trade.setupTag.toLowerCase().includes(query)
          );
        }
        
        return filteredTrades.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
    }),
    {
      name: 'trade-journal-storage',
    }
  )
);

// Analytics helpers
export const calculateStats = (trades: Trade[]) => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      totalPnL: 0,
      avgRRR: 0,
      bestDay: { date: '-', pnl: 0 },
      worstDay: { date: '-', pnl: 0 },
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      avgWin: 0,
      avgLoss: 0,
    };
  }

  const winningTrades = trades.filter((t) => t.result === 'win');
  const losingTrades = trades.filter((t) => t.result === 'loss');
  const breakevenTrades = trades.filter((t) => t.result === 'breakeven');

  const totalPnL = trades.reduce((sum, t) => sum + t.pnlAmount, 0);
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnlAmount, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlAmount, 0));

  const winRate = (winningTrades.length / trades.length) * 100;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  const avgRRR = trades.reduce((sum, t) => sum + t.rrr, 0) / trades.length;
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

  // Group by date for best/worst day
  const dailyPnL: { [key: string]: number } = {};
  trades.forEach((trade) => {
    dailyPnL[trade.date] = (dailyPnL[trade.date] || 0) + trade.pnlAmount;
  });

  const days = Object.entries(dailyPnL).map(([date, pnl]) => ({ date, pnl }));
  const bestDay = days.reduce((best, day) => (day.pnl > best.pnl ? day : best), { date: '-', pnl: -Infinity });
  const worstDay = days.reduce((worst, day) => (day.pnl < worst.pnl ? day : worst), { date: '-', pnl: Infinity });

  return {
    totalTrades: trades.length,
    winRate,
    profitFactor,
    totalPnL,
    avgRRR,
    bestDay: bestDay.pnl === -Infinity ? { date: '-', pnl: 0 } : bestDay,
    worstDay: worstDay.pnl === Infinity ? { date: '-', pnl: 0 } : worstDay,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakevenTrades: breakevenTrades.length,
    avgWin,
    avgLoss,
  };
};

export const getEquityCurve = (trades: Trade[]) => {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let balance = 10000; // Starting balance
  return sortedTrades.map((trade) => {
    balance += trade.pnlAmount;
    return {
      date: trade.date,
      balance,
      pnl: trade.pnlAmount,
    };
  });
};

export const getMonthlyPnL = (trades: Trade[]) => {
  const monthlyData: { [key: string]: { month: string; pnl: number; trades: number; wins: number } } = {};

  trades.forEach((trade) => {
    const month = trade.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { month, pnl: 0, trades: 0, wins: 0 };
    }
    monthlyData[month].pnl += trade.pnlAmount;
    monthlyData[month].trades += 1;
    if (trade.result === 'win') monthlyData[month].wins += 1;
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};
