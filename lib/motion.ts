"use client";

import * as FramerMotion from "framer-motion";

// Export specific named exports from framer-motion
export const {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useInView,
  useAnimation,
  useDragControls,
  useMotionTemplate,
  animate
} = FramerMotion;

// Export types
export type MotionProps = FramerMotion.MotionProps;
export type Variants = FramerMotion.Variants;
export type UseInViewOptions = FramerMotion.UseInViewOptions; 