"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface BlurFadeTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function BlurFadeText({ children, delay = 0, className = "" }: BlurFadeTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, filter: "blur(10px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
