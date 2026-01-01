import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PingPosition, MapState } from '@/hooks/useCursorSync';

interface PingOverlayProps {
  pings: PingPosition[];
  mapState?: MapState;
  imageRect?: DOMRect | null;
  containerRect?: DOMRect | null;
}

// Zoom-based scaling constants (same as CursorOverlay)
const MIN_VISIBLE_SCALE = 0.35;
const LOW_OPACITY_SCALE = 0.5;
const MAX_PING_SCALE = 1.5;
const MIN_PING_SCALE = 0.5;

const PingOverlay = memo(({ pings, mapState, imageRect, containerRect }: PingOverlayProps) => {
  const zoomScale = mapState?.scale ?? 1;
  
  // Don't render anything if zoom is too low or no rects available
  if (zoomScale < MIN_VISIBLE_SCALE || !imageRect || !containerRect) {
    return null;
  }
  
  // Calculate ping scale: proportional to zoom
  const pingScale = Math.min(
    MAX_PING_SCALE,
    Math.max(MIN_PING_SCALE, zoomScale)
  );
  
  // Calculate opacity: fade out at low zoom levels
  const pingOpacity = zoomScale < LOW_OPACITY_SCALE
    ? (zoomScale - MIN_VISIBLE_SCALE) / (LOW_OPACITY_SCALE - MIN_VISIBLE_SCALE)
    : 1;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence>
        {pings.map((ping) => {
          // Convert normalized (u,v) to screen pixels using image rect
          const screenX = imageRect.left + ping.u * imageRect.width;
          const screenY = imageRect.top + ping.v * imageRect.height;
          
          // Convert screen pixels to container-relative percentages
          const displayX = ((screenX - containerRect.left) / containerRect.width) * 100;
          const displayY = ((screenY - containerRect.top) / containerRect.height) * 100;
          
          // Hide pings outside viewport with some margin
          const isVisible = displayX >= -20 && displayX <= 120 && displayY >= -20 && displayY <= 120;
          
          if (!isVisible) return null;
          
          return (
            <motion.div
              key={ping.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: pingOpacity }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute"
              style={{
                left: `${displayX}%`,
                top: `${displayY}%`,
                transform: `translate(-50%, -50%) scale(${pingScale})`,
              }}
            >
              {/* Three expanding rings */}
              {[0, 1, 2].map((ringIndex) => (
                <motion.div
                  key={ringIndex}
                  className="absolute rounded-full"
                  style={{
                    border: `2px solid ${ping.color}`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ 
                    width: 8, 
                    height: 8, 
                    opacity: 0.8 
                  }}
                  animate={{ 
                    width: [8, 60, 100], 
                    height: [8, 60, 100], 
                    opacity: [0.8, 0.4, 0] 
                  }}
                  transition={{
                    duration: 2.5,
                    delay: ringIndex * 0.3,
                    ease: 'easeOut',
                    repeat: 0,
                  }}
                />
              ))}
              
              {/* Center dot */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: ping.color,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 8px ${ping.color}`,
                }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: [1, 0.8, 0], opacity: [1, 0.8, 0] }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

PingOverlay.displayName = 'PingOverlay';

export default PingOverlay;