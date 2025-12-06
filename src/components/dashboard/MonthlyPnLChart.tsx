import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTradeStore, getMonthlyPnL } from '@/store/tradeStore';

export function MonthlyPnLChart() {
  const trades = useTradeStore((state) => state.trades);
  const data = getMonthlyPnL(trades);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  type TooltipPayloadItem = { payload: { pnl: number; trades: number; wins: number } };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string | number }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-card rounded-lg p-3 shadow-xl border border-border/50">
          <p className="text-sm font-medium text-foreground mb-2">
            {new Date(label + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <div className="space-y-1">
            <p className={`text-lg font-bold number-mono ${item.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.trades} trades • {item.wins} wins
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monthly P&L</h3>
          <p className="text-sm text-muted-foreground">Profit and loss by month</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'short' })}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
