"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
}

/**
 * Componente de borda brilhante e animada.
 * Proporciona um visual tático e moderno para containers de destaque.
 */
export function BorderGlow({
  children,
  className,
  borderRadius = 30,
  backgroundColor = "#060010",
  animated = true,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  glowRadius = 18,
}: BorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative p-[1.5px] group overflow-hidden h-full", className)}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Animated Border Background */}
      <div
        className={cn(
          "absolute inset-[-150%] transition-opacity duration-500",
          animated ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        style={{
          background: `conic-gradient(from 0deg, ${colors.join(", ")}, ${colors[0]})`,
          animation: animated ? "border-spin 6s linear infinite" : "none",
        }}
      />

      {/* Mouse Follow Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 blur-3xl z-10"
        style={{
          opacity: opacity * 0.6,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${colors[0]}, transparent ${glowRadius * 3}px)`,
        }}
      />

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
