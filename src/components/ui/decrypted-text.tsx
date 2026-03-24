
"use client"

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface DecryptedTextProps {
  text: string;
  className?: string;
  animateOnHover?: boolean;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export function DecryptedText({ text, className, animateOnHover = false }: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    startScramble();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span
      className={className}
      onMouseEnter={() => {
        if (animateOnHover) startScramble();
      }}
    >
      {displayText}
    </span>
  );
}
