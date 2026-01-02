import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import portalSilhouette from "@/assets/portal-silhouette.webp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

// Generate floating particles - some behind, some in front
const generateParticles = (count: number, layer: 'back' | 'front') => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${layer}-${i}`,
    x: Math.random() * 100 - 50, // -50% to 50% from center
    y: Math.random() * 100 - 50,
    size: layer === 'back' ? 2 + Math.random() * 4 : 1.5 + Math.random() * 2.5,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 3,
    opacity: layer === 'back' ? 0.4 + Math.random() * 0.4 : 0.2 + Math.random() * 0.3,
  }));
};

const CTASection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const backParticles = useMemo(() => generateParticles(20, 'back'), []);
  const frontParticles = useMemo(() => generateParticles(8, 'front'), []);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleApplyClick = () => {
    if (user) {
      navigate('/basvuru');
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <section className="py-10 md:py-24 lg:py-28 relative overflow-visible">
      {/* Subtle ambient glow - no animation */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(ellipse at center bottom, hsl(var(--primary) / 0.08) 0%, transparent 60%)",
        }}
      />

      <motion.div
        ref={sectionRef}
        className="container mx-auto px-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-lg mx-auto text-center relative">

          {/* Background Particles - Behind zombie */}
          <div className="absolute inset-0 pointer-events-none" style={{ width: '150%', left: '-25%', height: '120%', top: '-10%' }}>
            {backParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-primary"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${50 + particle.x}%`,
                  top: `${50 + particle.y}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Zombie Image */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative mx-auto w-[360px] md:w-[480px]">
              <img
                src={portalSilhouette}
                alt="Zombie"
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Front Particles - In front of zombie */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{ width: '140%', left: '-20%', height: '100%' }}>
            {frontParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-primary"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${50 + particle.x}%`,
                  top: `${50 + particle.y}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [particle.opacity * 0.3, particle.opacity, particle.opacity * 0.3],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* CTA Button - Overlaps zombie */}
          <motion.div
            className="relative z-30 -mt-32 md:-mt-48"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="glow"
                size="lg"
                className="px-12 py-6 text-sm font-medium rounded-sm relative overflow-hidden group"
                onClick={handleApplyClick}
              >
                <span className="relative z-10">Başvur</span>
                <span className="ml-2 relative z-10">↗</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </section>
  );
};

export default CTASection;
