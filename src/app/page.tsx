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
  const [displayMode, setDisplayMode] = useState<DisplayMode>('Essencial');
  const [assets, setAssets] = useState<UserAsset[]>([
    { id: '1', name: 'VALE3', type: 'Ação', location: 'XP Investimentos', riskLevel: 'Moderado' },
    { id: '2', name: 'Bitcoin (BTC)', type: 'Criptomoeda', location: 'Ledger Cold Wallet', riskLevel: 'Conservador' },
    { id: '3', name: 'Fiagro VGIA11', type: 'Fundo Imobiliário', location: 'BTG Pactual', riskLevel: 'Agressivo' }
  ]);

  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);

  useEffect(() => {
    setAlerts([
      {
        id: 'a1',
        title: 'Alerta de Seca: Mato Grosso',
        origin: 'Natureza',
        causality: 'Baixa precipitação no centro-oeste impactará a safra de soja, afetando diretamente os dividendos do Fiagro em sua carteira.',
        priority: 4,
        timestamp: new Date()
      },
      {
        id: 'a2',
        title: 'Estímulo de Infraestrutura na China',
        origin: 'Geopolítica',
        causality: 'Pequim anuncia estímulo de $500B. Dados históricos mostram 92% de correlação com a valorização da VALE3 em 30 dias.',
        priority: 3,
        timestamp: new Date(Date.now() - 3600000)
      }
    ]);
  }, []);

  const [newAsset, setNewAsset] = useState<Partial<UserAsset>>({
    name: '',
    type: 'Ação',
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
    setNewAsset({ name: '', type: 'Ação', location: '' });
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-background font-bold text-xl font-headline italic">N</div>
          <h1 className="font-headline font-bold text-xl tracking-tighter hidden sm:block">NEXUS AI SENTINEL</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <Button 
              variant={displayMode === 'Essencial' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setDisplayMode('Essencial')}
              className={displayMode === 'Essencial' ? 'rounded-full px-4' : 'rounded-full px-4 text-muted-foreground'}
            >
              <Eye className="h-3 w-3 mr-2" /> Essencial
            </Button>
            <Button 
              variant={displayMode === 'Completo' ? 'accent' : 'ghost'} 
              size="sm" 
              onClick={() => setDisplayMode('Completo')}
              className={displayMode === 'Completo' ? 'rounded-full px-4 bg-accent text-white' : 'rounded-full px-4 text-muted-foreground'}
            >
              <Shield className="h-3 w-3 mr-2" /> Análise Completa
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
                <LayoutDashboard className="h-4 w-4" /> Visão Geral
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-background gap-2">
                <Wallet className="h-4 w-4" /> Portfólio
              </TabsTrigger>
            </TabsList>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/80 text-white gap-2 rounded-full px-6">
                  <Plus className="h-4 w-4" /> Registrar Ativo
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-accent/20">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">Novo Nó Preditivo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome ou Ticker do Ativo</Label>
                    <Input id="name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="ex: AAPL, BTC, Ouro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Ativo</Label>
                    <Select value={newAsset.type} onValueChange={v => setNewAsset({...newAsset, type: v as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ação">Ação</SelectItem>
                        <SelectItem value="Criptomoeda">Criptomoeda</SelectItem>
                        <SelectItem value="Fundo Imobiliário">Fundo Imobiliário</SelectItem>
                        <SelectItem value="Commodity">Commodity</SelectItem>
                        <SelectItem value="Moeda">Moeda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Custódia / Localização</Label>
                    <Input id="location" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} placeholder="ex: Binance, Ledger, XP" />
                  </div>
                  <Button onClick={addAsset} className="w-full bg-primary text-background font-bold">Monitorar Ativo</Button>
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
                <h2 className="text-xl font-headline font-bold">Nós de Portfólio Ativos</h2>
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
                  <h2 className="text-2xl font-headline font-bold">Registro de Ativos</h2>
                  <p className="text-sm text-muted-foreground">O Nexus nunca solicita suas chaves privadas ou senhas bancárias.</p>
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
                           <p className="text-xs text-muted-foreground uppercase tracking-wider font-headline mb-1">Risco do Nó</p>
                           <span className={`text-sm font-medium ${asset.riskLevel === 'Crítico' ? 'text-rose-400' : 'text-emerald-400'}`}>
                             {asset.riskLevel}
                           </span>
                         </div>
                         <Button variant="ghost" size="sm" onClick={() => removeAsset(asset.id)} className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10">Remover</Button>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Nenhum ativo registrado. Adicione seu primeiro nó para começar o monitoramento.</p>
                    </div>
                  )}
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      <AssistantChat assets={assets} displayMode={displayMode} />
    </div>
  );
}
