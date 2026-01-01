import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImage from "@/assets/logo.png";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Scroll lock - modal açıkken sayfa kaydırmasını engelle
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Discord login error:', error);
        toast.error('Giriş yapılırken bir hata oluştu', {
          description: error.message,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Beklenmeyen bir hata oluştu', {
        description: 'Lütfen daha sonra tekrar deneyin.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal Container - clicking outside closes */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated moving glow effects */}
              <motion.div 
                className="absolute -top-32 -left-32 w-64 h-64 bg-primary/30 rounded-full blur-[100px] pointer-events-none"
                animate={{
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div 
                className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/25 rounded-full blur-[100px] pointer-events-none"
                animate={{
                  x: [0, -40, 0],
                  y: [0, -20, 0],
                  scale: [1.2, 1, 1.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/15 rounded-full blur-[80px] pointer-events-none"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Background with gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/30 via-primary/10 to-transparent p-[1px]">
                <div className="h-full w-full rounded-2xl bg-background/95 backdrop-blur-xl" />
              </div>
              
              {/* Content */}
              <div className="relative px-8 py-10">
                {/* Close button */}
                <motion.button
                  className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
                
                {/* Logo */}
                <div className="text-center mb-8">
                  <motion.div
                    className="flex justify-center mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", damping: 20 }}
                  >
                    <img 
                      src={logoImage} 
                      alt="Kaze Community" 
                      className="w-32 h-32 object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-5"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  />
                  
                  <motion.p 
                    className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Sunucuda oynarken kullanacağınız Discord hesabı ile giriş yapmayı unutmayın!
                  </motion.p>
                </div>
                
                {/* Discord Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] group"
                    onClick={handleDiscordLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <svg 
                        className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                      </svg>
                    )}
                    {isLoading ? 'Yönlendiriliyor...' : 'Discord ile Giriş Yap'}
                  </Button>
                </motion.div>
                
                {/* Decorative line */}
                <motion.div 
                  className="w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent mt-8 mb-6"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
                
                {/* Copyright */}
                <motion.p 
                  className="text-center text-muted-foreground/60 text-xs tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  © 2025 Kaze Community - Tüm hakları saklıdır.
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
