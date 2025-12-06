import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart';
import { useTradeStore, calculateStats, Trade } from '@/store/tradeStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  AlertTriangle,
} from 'lucide-react';

export default function Analytics() {
  const trades = useTradeStore((state) => state.trades);
  const stats = calculateStats(trades);

  // Win rate by session
  const sessionStats = useMemo(() => {
    const sessions = ['asia', 'london', 'newyork'];
    return sessions.map((session) => {
      const sessionTrades = trades.filter((t) => t.session === session);
      const wins = sessionTrades.filter((t) => t.result === 'win').length;
      const winRate = sessionTrades.length > 0 ? (wins / sessionTrades.length) * 100 : 0;
      return {
        session: session.charAt(0).toUpperCase() + session.slice(1),
        winRate: Number(winRate.toFixed(1)),
        trades: sessionTrades.length,
        color: winRate >= 50 ? 'hsl(var(--profit))' : 'hsl(var(--loss))',
      };
    });
  }, [trades]);

  // Win rate by day of week
  const dayStats = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((day, index) => {
      const dayTrades = trades.filter((t) => new Date(t.date).getDay() === index);
      const wins = dayTrades.filter((t) => t.result === 'win').length;
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
      return {
        day: day.slice(0, 3),
        winRate: Number(winRate.toFixed(1)),
        trades: dayTrades.length,
        color: winRate >= 50 ? 'hsl(var(--profit))' : 'hsl(var(--loss))',
      };
    }).filter((d) => d.trades > 0);
  }, [trades]);

  // Best and worst pairs
  const pairStats = useMemo(() => {
    const pairMap: { [key: string]: { pnl: number; trades: number; wins: number } } = {};
    trades.forEach((trade) => {
      if (!pairMap[trade.pair]) {
        pairMap[trade.pair] = { pnl: 0, trades: 0, wins: 0 };
      }
      pairMap[trade.pair].pnl += trade.pnlAmount;
      pairMap[trade.pair].trades += 1;
      if (trade.result === 'win') pairMap[trade.pair].wins += 1;
    });

    const pairs = Object.entries(pairMap).map(([pair, data]) => ({
      pair,
      ...data,
      winRate: (data.wins / data.trades) * 100,
    }));

    const sorted = pairs.sort((a, b) => b.pnl - a.pnl);
    return {
      best: sorted[0] || null,
      worst: sorted[sorted.length - 1] || null,
      all: sorted,
    };
  }, [trades]);

  // Setup accuracy
  const setupStats = useMemo(() => {
    const setupMap: { [key: string]: { trades: number; wins: number } } = {};
    trades.forEach((trade) => {
      if (!trade.setupTag) return;
      if (!setupMap[trade.setupTag]) {
        setupMap[trade.setupTag] = { trades: 0, wins: 0 };
      }
      setupMap[trade.setupTag].trades += 1;
      if (trade.result === 'win') setupMap[trade.setupTag].wins += 1;
    });

    return Object.entries(setupMap)
      .map(([setup, data]) => ({
        setup,
        ...data,
        winRate: (data.wins / data.trades) * 100,
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [trades]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  type TooltipPayloadItem = { value: number; payload: { color: string; trades: number } };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string | number }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="glass-card rounded-lg p-3 shadow-xl border border-border/50">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-lg font-bold number-mono" style={{ color: item.payload.color }}>
            {item.value}%
          </p>
          <p className="text-xs text-muted-foreground">
            {item.payload.trades} trades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your trading performance
          </p>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Most Profitable Pair"
            value={pairStats.best?.pair || '-'}
            subtitle={pairStats.best ? formatCurrency(pairStats.best.pnl) : '-'}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="profit"
            delay={0}
          />
          <StatCard
            title="Least Profitable Pair"
            value={pairStats.worst?.pair || '-'}
            subtitle={pairStats.worst ? formatCurrency(pairStats.worst.pnl) : '-'}
            icon={<TrendingDown className="w-5 h-5" />}
            variant="loss"
            delay={0.05}
          />
          <StatCard
            title="Best Setup"
            value={setupStats[0]?.setup || '-'}
            subtitle={setupStats[0] ? `${setupStats[0].winRate.toFixed(1)}% win rate` : '-'}
            icon={<Target className="w-5 h-5" />}
            variant="primary"
            delay={0.1}
          />
          <StatCard
            title="Avg Win vs Avg Loss"
            value={`${(stats.avgWin / (stats.avgLoss || 1)).toFixed(2)}x`}
            subtitle={`$${stats.avgWin.toFixed(0)} / $${stats.avgLoss.toFixed(0)}`}
            icon={<Award className="w-5 h-5" />}
            variant="default"
            delay={0.15}
          />
        </div>

        {/* Equity Curve */}
        <EquityCurveChart />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Win Rate by Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Win Rate by Session</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Performance across different trading sessions
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="session"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                  <Bar dataKey="winRate" radius={[0, 4, 4, 0]} animationDuration={1500}>
                    {sessionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Win Rate by Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Win Rate by Day</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Best performing days of the week
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                  <Bar dataKey="winRate" radius={[4, 4, 0, 0]} animationDuration={1500}>
                    {dayStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Setup Performance & Pair Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Setup Accuracy</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Win rate by trading setup
            </p>
            <div className="space-y-3">
              {setupStats.slice(0, 6).map((setup, index) => (
                <div key={setup.setup} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-foreground truncate">
                    {setup.setup}
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${setup.winRate}%` }}
                      transition={{ duration: 1, delay: 0.1 * index }}
                      className={`h-full rounded-full ${setup.winRate >= 50 ? 'bg-profit' : 'bg-loss'}`}
                    />
                  </div>
                  <div className="w-20 text-right">
                    <span className={`text-sm font-semibold number-mono ${setup.winRate >= 50 ? 'text-profit' : 'text-loss'}`}>
                      {setup.winRate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({setup.trades})
                    </span>
                  </div>
                </div>
              ))}
              {setupStats.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No setup data available
                </p>
              )}
            </div>
          </motion.div>

          {/* Pair Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Pair Performance</h3>
            <p className="text-sm text-muted-foreground mb-6">
              P&L breakdown by trading pair
            </p>
            <div className="space-y-3">
              {pairStats.all.slice(0, 6).map((pair, index) => (
                <div key={pair.pair} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground">{pair.pair}</p>
                    <p className="text-xs text-muted-foreground">
                      {pair.trades} trades • {pair.winRate.toFixed(1)}% win rate
                    </p>
                  </div>
                  <div className={`text-lg font-bold number-mono ${pair.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {pair.pnl >= 0 ? '+' : ''}{formatCurrency(pair.pnl)}
                  </div>
                </div>
              ))}
              {pairStats.all.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No pair data available
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
