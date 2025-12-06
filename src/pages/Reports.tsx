import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useTradeStore, calculateStats, getMonthlyPnL } from '@/store/tradeStore';
import { FileText, Download, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Reports() {
  const trades = useTradeStore((state) => state.trades);
  const stats = calculateStats(trades);
  const monthlyData = getMonthlyPnL(trades);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Quality scale for html2canvas. 2-3 is typical; higher = sharper but heavier memory.
  const captureScale = 2.5;

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

  const generateReport = async () => {
    if (!reportRef.current) {
      toast({ title: 'Error', description: 'Report element not found.' });
      return;
    }

    setIsGenerating(true);
    try {
      toast({ title: 'Generating PDF', description: 'Please wait...' });

      // Capture the report area as a high-resolution canvas
      const canvas = await html2canvas(reportRef.current, { scale: captureScale });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Margins in mm
      const marginTop = 12;
      const marginBottom = 12;
      const marginLeft = 12;
      const marginRight = 12;

      const usablePageWidth = pageWidth - marginLeft - marginRight;
      const usablePageHeight = pageHeight - marginTop - marginBottom;

      // Helper conversions between px and mm (assume 96 DPI base)
      const pxToMm = (px: number) => (px * 25.4) / 96;
      const mmToPx = (mm: number) => (mm * 96) / 25.4;

      const srcWidthPx = canvas.width;
      const srcHeightPx = canvas.height;

      // Image dimensions in mm for the full canvas
      const imgWidthMm = pxToMm(srcWidthPx);
      const imgHeightMm = pxToMm(srcHeightPx);

      // Scale factor to fit width to usable page width
      const scale = usablePageWidth / imgWidthMm;

      // Convert usable page height to px on source canvas to slice (accounting for scale)
      const pageSliceHeightPx = Math.floor(mmToPx(usablePageHeight / scale));

      // Number of pages required
      const totalPages = Math.ceil(srcHeightPx / pageSliceHeightPx);

      for (let page = 0; page < totalPages; page++) {
        // Create a temporary canvas to hold the slice for this PDF page
        const sliceCanvas = document.createElement('canvas');
        const sliceHeightPx = Math.min(pageSliceHeightPx, srcHeightPx - page * pageSliceHeightPx);
        sliceCanvas.width = srcWidthPx;
        sliceCanvas.height = sliceHeightPx;

        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        // Draw the slice from the source canvas onto the slice canvas
        ctx.drawImage(
          canvas,
          0,
          page * pageSliceHeightPx,
          srcWidthPx,
          sliceHeightPx,
          0,
          0,
          srcWidthPx,
          sliceHeightPx
        );

        const imgData = sliceCanvas.toDataURL('image/png');

        // Height in mm for this slice after scaling to PDF usable width
        const sliceHeightMm = pxToMm(sliceHeightPx) * scale;

        const x = marginLeft;
        const y = marginTop + 8; // leave space for header

        // Add header (title + date) at top of each page
        pdf.setFontSize(12);
        const headerText = 'TradeLog - Reports';
        const dateText = new Date().toLocaleDateString();
        pdf.text(headerText, pageWidth / 2, 10, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text(dateText, pageWidth - marginRight, 10, { align: 'right' });

        // Add the slice image
        pdf.addImage(imgData, 'PNG', x, y, usablePageWidth, sliceHeightMm);

        // Footer with page numbers
        const footerText = `Page ${page + 1} of ${totalPages}`;
        pdf.setFontSize(9);
        pdf.text(footerText, pageWidth / 2, pageHeight - 6, { align: 'center' });

        if (page < totalPages - 1) pdf.addPage();
      }

      pdf.save(`trading-report-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({ title: 'Done', description: 'PDF downloaded successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to generate PDF.' });
      console.error('PDF generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6" ref={reportRef}>
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
            <Button onClick={generateReport} className="gap-2" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate PDF'}
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
