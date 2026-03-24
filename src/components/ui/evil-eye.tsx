"use client"

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * Componente EvilEye - Inspirado no React Bits.
 * Representa a onisciência do Nexus AI, seguindo o movimento do mouse.
 */
export function EvilEye() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Calcula a posição relativa (-0.5 a 0.5)
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { damping: 30, stiffness: 200 };
  const mouseX = useSpring(mousePos.x, springConfig);
  const mouseY = useSpring(mousePos.y, springConfig);

  // Mapeia o movimento do mouse para o deslocamento da pupila
  const pupilX = useTransform(mouseX, [-0.5, 0.5], [-25, 25]);
  const pupilY = useTransform(mouseY, [-0.5, 0.5], [-15, 15]);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-30">
      <div className="relative w-[800px] h-[800px] flex items-center justify-center">
        
        {/* Anéis Orbitais Externos */}
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-[10%] rounded-full border border-primary/5 animate-[spin_25s_linear_reverse_infinite]" />
        <div className="absolute inset-[20%] rounded-full border border-primary/20 animate-[spin_40s_linear_infinite]" />

        {/* O Olho */}
        <div className="relative w-[400px] h-[200px] bg-background border-2 border-primary/30 rounded-[100%] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] flex items-center justify-center">
          
          {/* Esclera / Brilho de Fundo */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

          {/* Íris e Pupila Animada */}
          <motion.div 
            style={{ x: pupilX, y: pupilY }}
            className="relative w-32 h-32 rounded-full border-2 border-primary/40 bg-[#080D18] flex items-center justify-center shadow-[inset_0_0_30px_rgba(37,99,235,0.5)]"
          >
            {/* Padrão de Íris */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h20L0 20z%22 fill=%22%232563eb%22 fill-opacity=%22.4%22/%3E%3C/svg%3E')] animate-pulse" />
            
            {/* Pupila Central */}
            <div className="w-12 h-12 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.8)] relative">
              {/* Pequeno reflexo tático */}
              <div className="absolute top-2 left-2 w-3 h-2 bg-white/40 rounded-full rotate-45 blur-[1px]" />
            </div>
          </motion.div>

          {/* Pálpebras sutis (efeito tático) */}
          <div className="absolute top-0 left-0 w-full h-[10%] bg-gradient-to-b from-background to-transparent z-10" />
          <div className="absolute bottom-0 left-0 w-full h-[10%] bg-gradient-to-t from-background to-transparent z-10" />
        </div>

        {/* Brilhos de Varredura */}
        <div className="absolute w-1 h-full bg-primary/20 blur-xl animate-[marquee_15s_linear_infinite] left-0 opacity-50" />
      </div>
    </div>
  );
}
