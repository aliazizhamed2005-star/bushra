import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Heart3DIcon,
  Star3DIcon,
  KurdistanFlagIcon,
  Flower3DIcon,
  Smiley3DIcon,
} from './PlayfulIcons';

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${4 + (i * 3.3) % 92}%`,
        delay: (i % 7) * 0.14,
        duration: 2.8 + (i % 4) * 0.5,
        rotate: (i % 2 === 0 ? 1 : -1) * (180 + (i % 5) * 45),
        kind: i % 5,
        color: ['#EC4899', '#8B5CF6', '#3B82F6', '#FACC15', '#EF4444', '#10B981'][i % 6],
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -40, opacity: 1, rotate: 0 }}
          animate={{
            y: ['0vh', '105vh'],
            rotate: [0, p.rotate],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ left: p.left }}
          className="absolute top-0"
        >
          {p.kind === 0 && <Heart3DIcon className="w-6 h-6" />}
          {p.kind === 1 && <Star3DIcon className="w-6 h-6" />}
          {p.kind === 2 && <KurdistanFlagIcon className="w-8 h-5" />}
          {p.kind === 3 && <Flower3DIcon className="w-6 h-6" />}
          {p.kind === 4 && (
            <div
              className="w-3.5 h-3.5 rounded-sm shadow-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
        </motion.div>
      ))}

      {/* Bouncing celebration smileys */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [-8, 8, -8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:block fixed bottom-10 left-10"
      >
        <Smiley3DIcon className="w-14 h-14" mood="laugh" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [8, -8, 8] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:block fixed bottom-10 right-10"
      >
        <Smiley3DIcon className="w-14 h-14" mood="love" />
      </motion.div>
    </div>
  );
}
