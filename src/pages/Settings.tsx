import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTradeStore } from '@/store/tradeStore';
import { toast } from '@/hooks/use-toast';
import {
  User,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Shield,
} from 'lucide-react';

export default function Settings() {
  const trades = useTradeStore((state) => state.trades);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const exportTrades = () => {
    const data = JSON.stringify(trades, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradelog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Backup Complete',
      description: `Exported ${trades.length} trades successfully.`,
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        toast({
          title: 'Import Ready',
          description: `Found ${data.length} trades. Feature coming soon.`,
        });
      } catch {
        toast({
          title: 'Import Failed',
          description: 'Invalid file format. Please use a valid JSON backup.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your account information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue="Trader" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="trader@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startingBalance">Starting Balance</Label>
              <Input id="startingBalance" type="number" defaultValue="10000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" defaultValue="USD" />
            </div>
          </div>

          <Button className="mt-4 gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure alerts and reminders</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications about your trades</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto-save</p>
                <p className="text-sm text-muted-foreground">Automatically save trade entries</p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
              <p className="text-sm text-muted-foreground">Backup and restore your trades</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-foreground">Backup Trades</p>
                <p className="text-sm text-muted-foreground">
                  Export all {trades.length} trades as JSON
                </p>
              </div>
              <Button variant="outline" onClick={exportTrades} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-foreground">Restore Trades</p>
                <p className="text-sm text-muted-foreground">Import trades from a backup file</p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <Button variant="outline" asChild className="gap-2">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                  </label>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6 border-loss/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-loss/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-loss" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">Irreversible actions</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-loss/5 border border-loss/10">
            <div>
              <p className="font-medium text-foreground">Delete All Trades</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your trade data
              </p>
            </div>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete All
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
