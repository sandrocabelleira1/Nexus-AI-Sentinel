"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Cpu, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth, initiateEmailSignIn, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    initiateEmailSignIn(auth, email, password)
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Falha na Autenticação",
          description: error.message || "E-mail ou senha incorretos.",
        });
      });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-primary/20 border border-primary/40 led-glow-blue mx-auto">
            <Cpu className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tighter led-text-blue">NEXUS AI SENTINEL</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Acesso ao Terminal de Comando</p>
        </div>

        <Card className="glass-panel border-white/10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold text-white">Login</CardTitle>
              <CardDescription className="text-white/50">Entre com suas credenciais de estrategista</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</Label>
                <Input 
                  type="email" 
                  required 
                  className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Senha</Label>
                <Input 
                  type="password" 
                  required 
                  className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-background font-bold text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ENTRAR NO SISTEMA"}
              </Button>
              <div className="text-center">
                <span className="text-xs text-white/40">Não tem uma conta? </span>
                <Link href="/register" className="text-xs text-primary font-bold hover:underline">Solicitar Acesso</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
