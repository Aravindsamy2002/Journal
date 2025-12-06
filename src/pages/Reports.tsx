import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useTradeStore, calculateStats, getMonthlyPnL } from '@/store/tradeStore';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Reports() {
  const trades = useTradeStore((state) => state.trades);
  const stats = calculateStats(trades);
  const monthlyData = getMonthlyPnL(trades);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const exportTrades = () => {
    const data = JSON.stringify(trades, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'Your trades have been exported successfully.',
    });
  };

  const generateReport = () => {
    toast({
      title: 'Coming Soon',
      description: 'PDF report generation will be available soon.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              Generate and export trading reports
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportTrades} className="gap-2">
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
            <Button onClick={generateReport} className="gap-2">
              <FileText className="w-4 h-4" />
              Generate PDF
            </Button>
          </div>
        </div>

        {/* Summary Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Performance Summary</h2>
              <p className="text-sm text-muted-foreground">Overall trading statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
              <p className="text-2xl font-bold number-mono text-foreground">{stats.totalTrades}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className={`text-2xl font-bold number-mono ${stats.winRate >= 50 ? 'text-profit' : 'text-loss'}`}>
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Profit Factor</p>
              <p className={`text-2xl font-bold number-mono ${stats.profitFactor >= 1 ? 'text-profit' : 'text-loss'}`}>
                {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
              <p className={`text-2xl font-bold number-mono ${stats.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(stats.totalPnL)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            <div className="text-center p-4 rounded-lg bg-profit/5 border border-profit/10">
              <p className="text-sm text-muted-foreground mb-1">Winning Trades</p>
              <p className="text-xl font-bold number-mono text-profit">{stats.winningTrades}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-loss/5 border border-loss/10">
              <p className="text-sm text-muted-foreground mb-1">Losing Trades</p>
              <p className="text-xl font-bold number-mono text-loss">{stats.losingTrades}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-profit/5 border border-profit/10">
              <p className="text-sm text-muted-foreground mb-1">Average Win</p>
              <p className="text-xl font-bold number-mono text-profit">{formatCurrency(stats.avgWin)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-loss/5 border border-loss/10">
              <p className="text-sm text-muted-foreground mb-1">Average Loss</p>
              <p className="text-xl font-bold number-mono text-loss">{formatCurrency(stats.avgLoss)}</p>
            </div>
          </div>
        </motion.div>

        {/* Monthly Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Monthly Breakdown</h2>
              <p className="text-sm text-muted-foreground">Performance by month</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Month</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Trades</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Wins</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Win Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">P&L</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => {
                  const winRate = (month.wins / month.trades) * 100;
                  return (
                    <tr key={month.month} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium text-foreground">
                        {new Date(month.month + '-01').toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center number-mono text-muted-foreground">
                        {month.trades}
                      </td>
                      <td className="py-3 px-4 text-center number-mono text-profit">
                        {month.wins}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${winRate >= 50 ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                          {winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold number-mono ${month.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {month.pnl >= 0 ? '+' : ''}{formatCurrency(month.pnl)}
                      </td>
                    </tr>
                  );
                })}
                {monthlyData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No monthly data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
