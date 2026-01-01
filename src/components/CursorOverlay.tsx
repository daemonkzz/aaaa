import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorPosition, MapState } from '@/hooks/useCursorSync';

interface CursorOverlayProps {
  cursors: CursorPosition[];
  mapState?: MapState;
  imageRect?: DOMRect | null;
  containerRect?: DOMRect | null;
}

// Cursor SVG component with gradient fill and colored border
const CursorIcon = ({ borderColor, odometer }: { borderColor: string; odometer: number }) => {
  const gradientId = `cursor-gradient-${odometer}`;
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.4))` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>
      <path
        d="M5.65376 3.45474L19.7449 11.7551C20.5174 12.2127 20.3767 13.3584 19.5143 13.6141L13.0749 15.5213L10.4717 21.6849C10.1265 22.5144 8.95046 22.4316 8.72185 21.5631L4.38929 4.76469C4.19053 4.00959 4.94052 3.35992 5.65376 3.45474Z"
        fill={`url(#${gradientId})`}
        stroke={borderColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Zoom-based scaling constants
const MIN_VISIBLE_SCALE = 0.35; // Hide cursor completely below this zoom
const LOW_OPACITY_SCALE = 0.5;  // Start reducing opacity below this
const MAX_CURSOR_SCALE = 1.5;   // Maximum cursor size multiplier
const MIN_CURSOR_SCALE = 0.5;   // Minimum cursor size multiplier

const CursorOverlay = memo(({ cursors, mapState, imageRect, containerRect }: CursorOverlayProps) => {
  // Calculate cursor scale and opacity based on map zoom
  const zoomScale = mapState?.scale ?? 1;
  
  // Don't render anything if zoom is too low or no rects available
  if (zoomScale < MIN_VISIBLE_SCALE || !imageRect || !containerRect) {
    return null;
  }
  
  // Calculate cursor scale: proportional to zoom for consistent visual size
  const cursorScale = Math.min(
    MAX_CURSOR_SCALE,
    Math.max(MIN_CURSOR_SCALE, zoomScale)
  );
  
  // Calculate opacity: fade out at low zoom levels
  const cursorOpacity = zoomScale < LOW_OPACITY_SCALE
    ? (zoomScale - MIN_VISIBLE_SCALE) / (LOW_OPACITY_SCALE - MIN_VISIBLE_SCALE)
    : 1;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {cursors.map((cursor, index) => {
          // Convert normalized (u,v) to screen pixels using image rect
          const screenX = imageRect.left + cursor.u * imageRect.width;
          const screenY = imageRect.top + cursor.v * imageRect.height;
          
          // Convert screen pixels to container-relative percentages
          const displayX = ((screenX - containerRect.left) / containerRect.width) * 100;
          const displayY = ((screenY - containerRect.top) / containerRect.height) * 100;
          
          // Hide cursors outside viewport with some margin
          const isVisible = displayX >= -10 && displayX <= 110 && displayY >= -10 && displayY <= 110;
          
          if (!isVisible) return null;
          
          return (
            <motion.div
              key={cursor.user_id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: cursorOpacity, 
                scale: cursorScale,
                left: `${displayX}%`,
                top: `${displayY}%`,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                opacity: { duration: 0.2 },
                scale: { duration: 0.15, ease: 'easeOut' },
                left: { duration: 0.1, ease: 'linear' },
                top: { duration: 0.1, ease: 'linear' },
              }}
              className="absolute origin-top-left"
              style={{
                transform: 'translate(-3px, -3px)',
              }}
            >
              {/* Cursor icon */}
              <CursorIcon borderColor={cursor.color} odometer={index} />
              
              {/* Minimalist username label - scales with cursor */}
              <div 
                className="absolute left-4 top-4 whitespace-nowrap px-1.5 py-0.5 
                           rounded text-[10px] font-medium text-white/80 
                           bg-black/30 backdrop-blur-[2px]"
                style={{ 
                  borderLeft: `2px solid ${cursor.color}`,
                }}
              >
                {(cursor.username || 'Anonim').slice(0, 10)}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
CursorOverlay.displayName = 'CursorOverlay';

export default CursorOverlay;