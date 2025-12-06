import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  delay?: number;
  variant?: 'default' | 'profit' | 'loss' | 'primary';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  delay = 0,
  variant = 'default',
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-profit';
      case 'down':
        return 'text-loss';
      default:
        return 'text-muted-foreground';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'profit':
        return 'border-profit/20 hover:border-profit/40';
      case 'loss':
        return 'border-loss/20 hover:border-loss/40';
      case 'primary':
        return 'border-primary/20 hover:border-primary/40';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={cn('stat-card', getVariantStyles(), className)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className={cn(
            'text-2xl font-bold number-mono',
            variant === 'profit' && 'text-profit',
            variant === 'loss' && 'text-loss',
            variant === 'primary' && 'text-primary'
          )}>
            {value}
          </h3>
        </div>
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            variant === 'profit' && 'bg-profit/10 text-profit',
            variant === 'loss' && 'bg-loss/10 text-loss',
            variant === 'primary' && 'bg-primary/10 text-primary',
            variant === 'default' && 'bg-muted text-muted-foreground'
          )}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
