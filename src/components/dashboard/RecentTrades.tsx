import { motion } from 'framer-motion';
import { useTradeStore } from '@/store/tradeStore';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function RecentTrades() {
  const trades = useTradeStore((state) => state.trades);
  const recentTrades = trades.slice(0, 5);
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Trades</h3>
          <p className="text-sm text-muted-foreground">Your latest trading activity</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/trades')}
          className="text-primary hover:text-primary/80"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {recentTrades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  trade.direction === 'buy'
                    ? 'bg-profit/10 text-profit'
                    : 'bg-loss/10 text-loss'
                )}
              >
                {trade.direction === 'buy' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {trade.pair}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(trade.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} • {trade.setupTag}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'font-bold number-mono',
                  trade.pnlAmount >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {trade.pnlAmount >= 0 ? '+' : ''}{formatCurrency(trade.pnlAmount)}
              </p>
              <p className="text-xs text-muted-foreground number-mono">
                {trade.rrr >= 0 ? '+' : ''}{trade.rrr.toFixed(2)}R
              </p>
            </div>
          </motion.div>
        ))}

        {recentTrades.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No trades recorded yet</p>
            <Button
              variant="link"
              onClick={() => navigate('/add-trade')}
              className="text-primary mt-2"
            >
              Add your first trade
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
