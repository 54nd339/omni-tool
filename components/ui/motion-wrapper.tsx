'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const slideUpVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function MotionWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
