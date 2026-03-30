
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  backgroundColor?: string;
  animated?: boolean;
  colors?: string[];
}

/**
 * Componente de borda brilhante otimizado.
 * Utiliza animações de hardware mais simples para evitar "engasgos" em dispositivos móveis.
 */
export function BorderGlow({
  children,
  className,
  borderRadius = 30,
  backgroundColor = "#060010",
  animated = true,
  colors = ["#2563eb", "#c084fc", "#38bdf8"],
}: BorderGlowProps) {
  return (
    <div
      className={cn("relative p-[1.5px] group overflow-hidden h-full", className)}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Optimized Border Animation */}
      {animated && (
        <div
          className="absolute inset-[-100%] transition-opacity duration-1000"
          style={{
            background: `conic-gradient(from 0deg, ${colors.join(", ")}, ${colors[0]})`,
            animation: "border-spin 8s linear infinite",
            willChange: "transform",
          }}
        />
      )}

      {/* Inner Content */}
      <div
        className="relative h-full w-full z-20"
        style={{
          borderRadius: `${borderRadius - 1.5}px`,
          backgroundColor: backgroundColor,
        }}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes border-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
