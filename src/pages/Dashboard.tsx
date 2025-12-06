import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart';
import { MonthlyPnLChart } from '@/components/dashboard/MonthlyPnLChart';
import { WinLossChart } from '@/components/dashboard/WinLossChart';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { useTradeStore, calculateStats } from '@/store/tradeStore';
import {
  TrendingUp,
  Target,
  Percent,
  DollarSign,
  Calendar,
  Award,
} from 'lucide-react';

export default function Dashboard() {
  const trades = useTradeStore((state) => state.trades);
  const stats = calculateStats(trades);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your trading performance overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle="All time"
            delay={0}
            variant="primary"
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            icon={<Target className="w-5 h-5" />}
            trend={stats.winRate >= 50 ? 'up' : 'down'}
            trendValue={stats.winRate >= 50 ? 'Above 50%' : 'Below 50%'}
            delay={0.05}
            variant={stats.winRate >= 50 ? 'profit' : 'loss'}
          />
          <StatCard
            title="Profit Factor"
            value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
            icon={<Percent className="w-5 h-5" />}
            trend={stats.profitFactor >= 1.5 ? 'up' : stats.profitFactor >= 1 ? 'neutral' : 'down'}
            trendValue={stats.profitFactor >= 1.5 ? 'Excellent' : stats.profitFactor >= 1 ? 'Good' : 'Needs work'}
            delay={0.1}
            variant={stats.profitFactor >= 1.5 ? 'profit' : 'default'}
          />
          <StatCard
            title="Total P&L"
            value={formatCurrency(stats.totalPnL)}
            icon={<DollarSign className="w-5 h-5" />}
            trend={stats.totalPnL >= 0 ? 'up' : 'down'}
            trendValue={stats.totalPnL >= 0 ? 'Profitable' : 'In drawdown'}
            delay={0.15}
            variant={stats.totalPnL >= 0 ? 'profit' : 'loss'}
          />
          <StatCard
            title="Avg RRR"
            value={`${stats.avgRRR.toFixed(2)}R`}
            icon={<Award className="w-5 h-5" />}
            trend={stats.avgRRR >= 1.5 ? 'up' : stats.avgRRR >= 1 ? 'neutral' : 'down'}
            trendValue={stats.avgRRR >= 1.5 ? 'Great' : 'Average'}
            delay={0.2}
            variant="default"
          />
          <StatCard
            title="Best Day"
            value={formatCurrency(stats.bestDay.pnl)}
            icon={<Calendar className="w-5 h-5" />}
            subtitle={stats.bestDay.date !== '-' ? new Date(stats.bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            delay={0.25}
            variant="profit"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityCurveChart />
          <MonthlyPnLChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTrades />
          </div>
          <WinLossChart />
        </div>
      </div>
    </AppLayout>
  );
}
