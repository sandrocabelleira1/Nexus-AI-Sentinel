
"use client"

import React, { useState, useMemo } from "react";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { UserProfile } from "@/lib/types";
import { AuthGuard } from "@/components/auth/auth-guard";
import { 
  ShieldCheck, 
  Users, 
  Download, 
  Search, 
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  Lock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { user } = useUser();

  // Verifica se o usuário é admin
  const adminCheckRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "admin_roles", user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminCheckRef);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse uppercase tracking-[0.5em]">Verificando Patente Alpha...</p>
      </div>
    );
  }

  if (!adminRole) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-6 rounded-full bg-rose-500/20 border border-rose-500/40 led-glow-accent">
          <Lock className="h-12 w-12 text-rose-500" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">ACESSO NEGADO</h1>
        <p className="text-white/40 max-w-md mx-auto font-medium">Seu UID não possui privilégios de administrador. O Nexus bloqueou esta sinapse.</p>
        <Link href="/">
          <Button variant="outline" className="border-primary/40 text-primary rounded-xl font-bold">RETORNAR AO TERMINAL</Button>
        </Link>
      </div>
    );
  }

  const exportData = () => {
    if (!users) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,Email,WhatsApp,Idade,Endereco,Data Cadastro\n"
      + users.map(u => `${u.displayName},${u.email},${u.whatsapp},${u.age},"${u.address}",${u.createdAt}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexus_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
        
        <header className="h-20 border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-primary rounded-xl">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/40 led-glow-blue">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-headline font-bold text-lg md:text-xl text-white tracking-tighter uppercase">Dossiê de Estrategistas</h1>
            </div>
          </div>

          <Button onClick={exportData} className="bg-primary text-background font-bold gap-2 rounded-xl h-12 px-6">
            <Download className="h-4 w-4" /> EXPORTAR CSV
          </Button>
        </header>

        <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-8 space-y-2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={80} /></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Total Recrutados</span>
              <div className="text-4xl font-headline font-bold text-white">{users?.length || 0}</div>
            </div>
            <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-8 space-y-2 shadow-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Status da Rede</span>
              <div className="text-4xl font-headline font-bold text-white uppercase">Operacional</div>
            </div>
            <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-8 space-y-2 shadow-2xl">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Nível de Comando</span>
              <div className="text-4xl font-headline font-bold text-white uppercase">Alpha 5</div>
            </div>
          </div>

          <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl border-t-primary/20">
            <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Base de Dados Central</h2>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  placeholder="Filtrar por nome, email ou whatsapp..." 
                  className="bg-white/5 border-white/10 pl-12 h-12 rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[600px] no-scrollbar">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest h-14">Estrategista</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest h-14">Contato & Operação</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest h-14">Perfil Tático</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest h-14">Localização</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest h-14 text-right">Ingresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isUsersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                        <span className="text-white/20 font-bold uppercase tracking-widest">Sincronizando com o Core...</span>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <span className="text-white/20 font-bold uppercase tracking-widest">Nenhum registro encontrado no radar.</span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-base">{u.displayName || "Sem Nome"}</span>
                            <span className="text-[9px] text-white/30 font-mono tracking-tighter">{u.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs text-white/70">
                              <Mail className="h-3.5 w-3.5 text-primary" /> {u.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/70">
                              <Phone className="h-3.5 w-3.5 text-emerald-500" /> {u.whatsapp || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                              {u.age ? `${u.age} ANOS` : 'N/A'}
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10 text-[10px] font-bold">
                              {u.preferredDisplayMode?.toUpperCase() || 'ESSENTIAL'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-white/60 max-w-[250px] leading-relaxed">
                            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" /> {u.address || "Sem Endereço"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-white">
                              {u.createdAt ? format(new Date(u.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '---'}
                            </span>
                            <span className="text-[10px] text-white/30 font-medium">
                              {u.createdAt ? format(new Date(u.createdAt), "HH:mm'h'", { locale: ptBR }) : '---'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
