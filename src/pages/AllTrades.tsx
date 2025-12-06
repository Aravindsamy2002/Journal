import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTradeStore, TradeFilters, Trade, Session, TradeResult, MarketType, AccountType } from '@/store/tradeStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AllTrades() {
  const navigate = useNavigate();
  const { trades, deleteTrade, duplicateTrade, getFilteredTrades } = useTradeStore();
  
  const [filters, setFilters] = useState<TradeFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredTrades = useMemo(() => {
    return getFilteredTrades(filters);
  }, [filters, trades, getFilteredTrades]);

  const handleDelete = (trade: Trade) => {
    deleteTrade(trade.id);
    toast({
      title: 'Trade Deleted',
      description: `${trade.pair} trade has been removed.`,
    });
  };

  const handleDuplicate = (trade: Trade) => {
    duplicateTrade(trade.id);
    toast({
      title: 'Trade Duplicated',
      description: `${trade.pair} trade has been duplicated.`,
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Trades</h1>
            <p className="text-muted-foreground">
              {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button onClick={() => navigate('/add-trade')} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Trade
          </Button>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search trades by pair, notes, or setup..."
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-border"
            >
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Session</label>
                <Select
                  value={filters.session || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, session: value === 'all' ? undefined : value as Session })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="newyork">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Result</label>
                <Select
                  value={filters.result || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, result: value === 'all' ? undefined : value as TradeResult })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="breakeven">Breakeven</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Market</label>
                <Select
                  value={filters.marketType || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, marketType: value === 'all' ? undefined : value as MarketType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Markets</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="indices">Indices</SelectItem>
                    <SelectItem value="commodities">Commodities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Account</label>
                <Select
                  value={filters.accountType || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, accountType: value === 'all' ? undefined : value as AccountType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    <SelectItem value="real">Real</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="funded">Funded</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Trades Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead className="text-center">Direction</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead className="text-center">Session</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">RRR</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {new Date(trade.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{trade.pair}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={cn(
                          'inline-flex items-center justify-center w-8 h-8 rounded-lg',
                          trade.direction === 'buy'
                            ? 'bg-profit/10 text-profit'
                            : 'bg-loss/10 text-loss'
                        )}
                      >
                        {trade.direction === 'buy' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">
                        {trade.setupTag || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center capitalize text-muted-foreground">
                      {trade.session}
                    </TableCell>
                    <TableCell className="text-right number-mono text-muted-foreground">
                      {trade.entryPrice.toFixed(trade.entryPrice < 10 ? 5 : 2)}
                    </TableCell>
                    <TableCell className="text-right number-mono text-muted-foreground">
                      {trade.exitPrice.toFixed(trade.exitPrice < 10 ? 5 : 2)}
                    </TableCell>
                    <TableCell className={cn(
                      'text-right number-mono font-semibold',
                      trade.rrr >= 0 ? 'text-profit' : 'text-loss'
                    )}>
                      {trade.rrr >= 0 ? '+' : ''}{trade.rrr.toFixed(2)}R
                    </TableCell>
                    <TableCell className={cn(
                      'text-right number-mono font-semibold',
                      trade.pnlAmount >= 0 ? 'text-profit' : 'text-loss'
                    )}>
                      {trade.pnlAmount >= 0 ? '+' : ''}${trade.pnlAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                        trade.result === 'win' && 'bg-profit/10 text-profit',
                        trade.result === 'loss' && 'bg-loss/10 text-loss',
                        trade.result === 'breakeven' && 'bg-muted text-muted-foreground'
                      )}>
                        {trade.result}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(trade)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(trade)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
                {filteredTrades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <p className="text-muted-foreground">No trades found</p>
                      <Button
                        variant="link"
                        onClick={() => navigate('/add-trade')}
                        className="text-primary mt-2"
                      >
                        Add your first trade
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
