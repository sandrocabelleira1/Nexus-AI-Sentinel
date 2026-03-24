"use client"

import React from "react";
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
  Lock
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
  const firestore = useFirestore();
  const { user } = useUser();

  // Verifica se o usuário é admin
  const adminCheckRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "admin_roles", user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminCheckRef);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse uppercase tracking-[0.5em]">Verificando Patente...</p>
      </div>
    );
  }

  if (!adminRole) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-6 rounded-full bg-rose-500/20 border border-rose-500/40 led-glow-accent">
          <Lock className="h-12 w-12 text-rose-500" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">ACESSO NEGADO</h1>
        <p className="text-white/40 max-w-md mx-auto">Seu UID não possui privilégios de administrador de nível 5. Entre em contato com o Core do Nexus.</p>
        <Link href="/">
          <Button variant="outline" className="border-primary/40 text-primary">RETORNAR AO TERMINAL</Button>
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
    link.setAttribute("download", `nexus_users_report_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
        
        <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-primary rounded-xl">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/40 led-glow-blue">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-headline font-bold text-xl text-white tracking-tighter uppercase">Relatório de Estrategistas</h1>
            </div>
          </div>

          <Button onClick={exportData} className="bg-primary text-background font-bold gap-2 rounded-xl">
            <Download className="h-4 w-4" /> EXPORTAR CSV
          </Button>
        </header>

        <main className="max-w-[1400px] mx-auto p-8 space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-8 space-y-2 shadow-2xl">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Total Recrutados</span>
              <div className="text-4xl font-headline font-bold text-white">{users?.length || 0}</div>
            </div>
            <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-8 space-y-2 shadow-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Status da Rede</span>
              <div className="text-4xl font-headline font-bold text-white">ATIVA</div>
            </div>
            <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-8 space-y-2 shadow-2xl">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Nível de Acesso</span>
              <div className="text-4xl font-headline font-bold text-white">ALPHA 5</div>
            </div>
          </div>

          <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white">Dossiê de Usuários</h2>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input placeholder="Filtrar por nome ou email..." className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl" />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Estrategista</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Contato</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Dados Pessoais</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Localização</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-widest text-right">Ingresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isUsersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                        <span className="text-white/20 font-bold uppercase tracking-widest">Baixando registros do Core...</span>
                      </TableCell>
                    </TableRow>
                  ) : users?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <span className="text-white/20 font-bold uppercase tracking-widest">Nenhum estrategista recrutado ainda.</span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users?.map((u) => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{u.displayName}</span>
                            <span className="text-[10px] text-white/30 font-mono">{u.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Mail className="h-3 w-3 text-primary" /> {u.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Phone className="h-3 w-3 text-emerald-500" /> {u.whatsapp}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              {u.age} anos
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10">
                              {u.preferredDisplayMode}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-white/60 max-w-[200px] truncate">
                            <MapPin className="h-3 w-3 text-accent" /> {u.address}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-white">
                              {format(new Date(u.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="text-[10px] text-white/30 italic">
                              {format(new Date(u.createdAt), "HH:mm", { locale: ptBR })}
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