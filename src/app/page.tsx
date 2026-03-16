"use client"

import { useState, useEffect } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { AIAlerts } from "@/components/dashboard/ai-alerts";
import { AssetCard } from "@/components/portfolio/asset-card";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { UserAsset, DisplayMode, GlobalAlert } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, Settings, LayoutDashboard, Wallet, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NexusDashboard() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('Essential');
  const [assets, setAssets] = useState<UserAsset[]>([
    { id: '1', name: 'VALE3', type: 'Stock', location: 'XP Investimentos', riskLevel: 'Moderado' },
    { id: '2', name: 'Bitcoin (BTC)', type: 'Cryptocurrency', location: 'Ledger Cold Wallet', riskLevel: 'Conservador' },
    { id: '3', name: 'Fiagro VGIA11', type: 'Real Estate Fund', location: 'BTG Pactual', riskLevel: 'Agressivo' }
  ]);

  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);

  useEffect(() => {
    // Prevent hydration mismatch by setting time-sensitive state after mount
    setAlerts([
      {
        id: 'a1',
        title: 'Drought Warning: Mato Grosso',
        origin: 'Natureza',
        causality: 'Low precipitation in central Brazil will impact soy yields, directly affecting Fiagro dividends in your portfolio.',
        priority: 4,
        timestamp: new Date()
      },
      {
        id: 'a2',
        title: 'China Infrastructure Stimulus',
        origin: 'Geopolítica',
        causality: 'Beijing announces $500B stimulus. Historical data shows 92% correlation with VALE3 price appreciation within 30 days.',
        priority: 3,
        timestamp: new Date(Date.now() - 3600000)
      }
    ]);
  }, []);

  const [newAsset, setNewAsset] = useState<Partial<UserAsset>>({
    name: '',
    type: 'Stock',
    location: ''
  });

  const addAsset = () => {
    if (!newAsset.name || !newAsset.location) return;
    const asset: UserAsset = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAsset.name,
      type: newAsset.type as any,
      location: newAsset.location,
      riskLevel: 'Moderado'
    };
    setAssets([...assets, asset]);
    setNewAsset({ name: '', type: 'Stock', location: '' });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-background font-bold text-xl font-headline italic">N</div>
          <h1 className="font-headline font-bold text-xl tracking-tighter hidden sm:block">NEXUS AI SENTINEL</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <Button 
              variant={displayMode === 'Essential' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setDisplayMode('Essential')}
              className={displayMode === 'Essential' ? 'rounded-full px-4' : 'rounded-full px-4 text-muted-foreground'}
            >
              <Eye className="h-3 w-3 mr-2" /> Essential
            </Button>
            <Button 
              variant={displayMode === 'Full' ? 'accent' : 'ghost'} 
              size="sm" 
              onClick={() => setDisplayMode('Full')}
              className={displayMode === 'Full' ? 'rounded-full px-4 bg-accent text-white' : 'rounded-full px-4 text-muted-foreground'}
            >
              <Shield className="h-3 w-3 mr-2" /> Full Analysis
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-background gap-2">
                <LayoutDashboard className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-background gap-2">
                <Wallet className="h-4 w-4" /> Portfolio
              </TabsTrigger>
            </TabsList>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/80 text-white gap-2 rounded-full px-6">
                  <Plus className="h-4 w-4" /> Register Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-accent/20">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">New Predictive Node</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Asset Name or Ticker</Label>
                    <Input id="name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. AAPL, ETH, Gold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Asset Type</Label>
                    <Select value={newAsset.type} onValueChange={v => setNewAsset({...newAsset, type: v as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stock">Stock</SelectItem>
                        <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                        <SelectItem value="Real Estate Fund">Real Estate Fund</SelectItem>
                        <SelectItem value="Commodity">Commodity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Storage / Custody Location</Label>
                    <Input id="location" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} placeholder="e.g. Binance, Ledger, XP" />
                  </div>
                  <Button onClick={addAsset} className="w-full bg-primary text-background font-bold">Monitor Asset</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <WorldMood />
              </div>
              <div className="lg:col-span-2">
                <AIAlerts alerts={alerts} />
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-bold">Active Portfolio Nodes</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="portfolio" className="animate-in fade-in duration-500">
             <div className="glass-panel rounded-2xl p-8 border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-headline font-bold">Asset Registry</h2>
                  <p className="text-sm text-muted-foreground">Nexus never requests your private keys or bank passwords.</p>
                </div>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold">{asset.name}</h4>
                          <p className="text-sm text-muted-foreground uppercase text-[10px] tracking-widest">{asset.type} • {asset.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right hidden sm:block">
                           <p className="text-xs text-muted-foreground uppercase tracking-wider font-headline mb-1">Risk Node</p>
                           <span className={`text-sm font-medium ${asset.riskLevel === 'Crítico' ? 'text-rose-400' : 'text-emerald-400'}`}>
                             {asset.riskLevel}
                           </span>
                         </div>
                         <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10">Delete</Button>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No assets registered yet. Add your first node to begin monitoring.</p>
                    </div>
                  )}
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating AI Assistant */}
      <AssistantChat assets={assets} displayMode={displayMode} />
    </div>
  );
}
