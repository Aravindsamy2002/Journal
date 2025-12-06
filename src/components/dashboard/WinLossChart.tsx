import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTradeStore, calculateStats } from '@/store/tradeStore';

export function WinLossChart() {
  const trades = useTradeStore((state) => state.trades);
  const stats = calculateStats(trades);

  const data = [
    { name: 'Wins', value: stats.winningTrades, color: 'hsl(var(--profit))' },
    { name: 'Losses', value: stats.losingTrades, color: 'hsl(var(--loss))' },
    { name: 'Breakeven', value: stats.breakevenTrades, color: 'hsl(var(--neutral))' },
  ].filter(item => item.value > 0);

  type TooltipPayloadItem = { name: string; value: number; payload: { color: string } };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="glass-card rounded-lg p-3 shadow-xl border border-border/50">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="text-lg font-bold number-mono" style={{ color: item.payload.color }}>
            {item.value} trades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Win/Loss Distribution</h3>
        <p className="text-sm text-muted-foreground">Trade outcome breakdown</p>
      </div>

      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-2xl font-bold number-mono text-foreground">{stats.totalTrades}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-semibold number-mono text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
