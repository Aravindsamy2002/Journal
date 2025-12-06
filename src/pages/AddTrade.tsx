import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTradeStore, TradeDirection, AccountType, Session, MarketType, TradeResult } from '@/store/tradeStore';
import { toast } from '@/hooks/use-toast';
import { Save, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const setupTags = [
  'SMC', 'FVG', 'Breakout', 'Liquidity Grab', 'Trend Continuation',
  'Order Block', 'Breaker Block', 'Mitigation', 'Inducement', 'CHoCH',
];

const emotionTags = ['Fear', 'Greed', 'Revenge', 'FOMO', 'Overconfidence', 'Impatience'];

export default function AddTrade() {
  const navigate = useNavigate();
  const addTrade = useTradeStore((state) => state.addTrade);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pair: '',
    direction: 'buy' as TradeDirection,
    accountType: 'funded' as AccountType,
    session: 'london' as Session,
    marketType: 'forex' as MarketType,
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    exitPrice: '',
    positionSize: '',
    riskPercent: '1',
    lotSize: '',
    setupTag: '',
    emotionTags: [] as string[],
    notes: '',
    observations: '',
    mistakes: '',
    lessons: '',
  });

  const [calculations, setCalculations] = useState({
    riskAmount: 0,
    rrr: 0,
    pnlAmount: 0,
    pnlPercent: 0,
    pipGain: 0,
    result: 'breakeven' as TradeResult,
  });

  // Auto-calculate values
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const sl = parseFloat(formData.stopLoss) || 0;
    const tp = parseFloat(formData.takeProfit) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const riskPercent = parseFloat(formData.riskPercent) || 0;
    const lotSize = parseFloat(formData.lotSize) || 0;

    if (entry && sl) {
      const slDistance = Math.abs(entry - sl);
      const tpDistance = tp ? Math.abs(tp - entry) : 0;
      const exitDistance = exit ? (formData.direction === 'buy' ? exit - entry : entry - exit) : 0;
      
      // Calculate pip gain (assuming standard forex pairs)
      const pipMultiplier = formData.pair.includes('JPY') ? 100 : 10000;
      const pipGain = exit ? Math.round(exitDistance * pipMultiplier) : 0;
      
      // Calculate RRR
      const rrrPlanned = tpDistance / slDistance;
      const rrrActual = exit ? exitDistance / slDistance : 0;
      
      // Calculate P&L
      const riskAmount = 10000 * (riskPercent / 100); // Assuming $10k account
      const pnlAmount = rrrActual * riskAmount;
      const pnlPercent = pnlAmount / 100;

      // Determine result
      let result: TradeResult = 'breakeven';
      if (pnlAmount > 0.01) result = 'win';
      else if (pnlAmount < -0.01) result = 'loss';

      setCalculations({
        riskAmount,
        rrr: Number(rrrActual.toFixed(2)),
        pnlAmount: Number(pnlAmount.toFixed(2)),
        pnlPercent: Number(pnlPercent.toFixed(2)),
        pipGain,
        result,
      });
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.exitPrice, formData.riskPercent, formData.direction, formData.pair, formData.lotSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pair || !formData.entryPrice || !formData.stopLoss || !formData.exitPrice) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addTrade({
      date: formData.date,
      pair: formData.pair.toUpperCase(),
      direction: formData.direction,
      accountType: formData.accountType,
      session: formData.session,
      marketType: formData.marketType,
      entryPrice: parseFloat(formData.entryPrice),
      stopLoss: parseFloat(formData.stopLoss),
      takeProfit: parseFloat(formData.takeProfit) || 0,
      exitPrice: parseFloat(formData.exitPrice),
      positionSize: parseFloat(formData.positionSize) || 0,
      riskAmount: calculations.riskAmount,
      riskPercent: parseFloat(formData.riskPercent),
      lotSize: parseFloat(formData.lotSize) || 0,
      rrr: calculations.rrr,
      pnlAmount: calculations.pnlAmount,
      pnlPercent: calculations.pnlPercent,
      pipGain: calculations.pipGain,
      setupTag: formData.setupTag,
      emotionTags: formData.emotionTags,
      notes: formData.notes,
      observations: formData.observations,
      mistakes: formData.mistakes,
      lessons: formData.lessons,
      screenshots: [],
      result: calculations.result,
    });

    toast({
      title: 'Trade Added',
      description: `${formData.pair} trade has been logged successfully.`,
    });

    navigate('/trades');
  };

  const toggleEmotionTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      emotionTags: prev.emotionTags.includes(tag)
        ? prev.emotionTags.filter((t) => t !== tag)
        : [...prev.emotionTags, tag],
    }));
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Trade</h1>
            <p className="text-muted-foreground">Record your trade with detailed information</p>
          </div>
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            Save Trade
          </Button>
        </div>

        {/* Trade Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
            Trade Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pair">Pair / Symbol *</Label>
              <Input
                id="pair"
                placeholder="e.g., XAUUSD, EURUSD"
                value={formData.pair}
                onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.direction === 'buy' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    formData.direction === 'buy' && 'bg-profit hover:bg-profit/90'
                  )}
                  onClick={() => setFormData({ ...formData, direction: 'buy' })}
                >
                  Buy / Long
                </Button>
                <Button
                  type="button"
                  variant={formData.direction === 'sell' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    formData.direction === 'sell' && 'bg-loss hover:bg-loss/90'
                  )}
                  onClick={() => setFormData({ ...formData, direction: 'sell' })}
                >
                  Sell / Short
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value: AccountType) => setFormData({ ...formData, accountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">Real</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              <Select
                value={formData.session}
                onValueChange={(value: Session) => setFormData({ ...formData, session: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="newyork">New York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Market Type</Label>
              <Select
                value={formData.marketType}
                onValueChange={(value: MarketType) => setFormData({ ...formData, marketType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="indices">Indices</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Entry & Exit Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
            Entry & Exit Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price *</Label>
              <Input
                id="entryPrice"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                className="number-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss *</Label>
              <Input
                id="stopLoss"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                className="number-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.takeProfit}
                onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                className="number-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price *</Label>
              <Input
                id="exitPrice"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                className="number-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionSize">Position Size</Label>
              <Input
                id="positionSize"
                type="number"
                step="any"
                placeholder="0"
                value={formData.positionSize}
                onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskPercent">Risk %</Label>
              <Input
                id="riskPercent"
                type="number"
                step="0.1"
                placeholder="1"
                value={formData.riskPercent}
                onChange={(e) => setFormData({ ...formData, riskPercent: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lotSize">Lot Size</Label>
              <Input
                id="lotSize"
                type="number"
                step="0.01"
                placeholder="0.01"
                value={formData.lotSize}
                onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
              />
            </div>
          </div>
        </motion.div>

        {/* Auto-calculated Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6 border-primary/20"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculated Values
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Risk Amount</p>
              <p className="text-xl font-bold number-mono text-foreground">
                ${calculations.riskAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">RRR</p>
              <p className={cn(
                'text-xl font-bold number-mono',
                calculations.rrr >= 0 ? 'text-profit' : 'text-loss'
              )}>
                {calculations.rrr >= 0 ? '+' : ''}{calculations.rrr.toFixed(2)}R
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">P&L Amount</p>
              <p className={cn(
                'text-xl font-bold number-mono',
                calculations.pnlAmount >= 0 ? 'text-profit' : 'text-loss'
              )}>
                {calculations.pnlAmount >= 0 ? '+' : ''}${calculations.pnlAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Pip Gain/Loss</p>
              <p className={cn(
                'text-xl font-bold number-mono',
                calculations.pipGain >= 0 ? 'text-profit' : 'text-loss'
              )}>
                {calculations.pipGain >= 0 ? '+' : ''}{calculations.pipGain}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Result</p>
              <p className={cn(
                'text-xl font-bold capitalize',
                calculations.result === 'win' && 'text-profit',
                calculations.result === 'loss' && 'text-loss',
                calculations.result === 'breakeven' && 'text-muted-foreground'
              )}>
                {calculations.result}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
            Trade Tags
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Setup Tag</Label>
              <div className="flex flex-wrap gap-2">
                {setupTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={formData.setupTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, setupTag: tag })}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Emotion Tags (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {emotionTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={formData.emotionTags.includes(tag) ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => toggleEmotionTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
            Notes & Reflections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Trade Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe your trade setup and reasoning..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                placeholder="What did you observe during the trade?"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mistakes">Mistakes</Label>
              <Textarea
                id="mistakes"
                placeholder="Any mistakes you made?"
                value={formData.mistakes}
                onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessons">Lessons Learned</Label>
              <Textarea
                id="lessons"
                placeholder="What did you learn from this trade?"
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            Save Trade
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
