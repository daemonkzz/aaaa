import { useAdminSession } from '@/contexts/AdminSessionContext';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SessionTimeoutIndicator = () => {
  const { remainingTime, isAdminAuthenticated } = useAdminSession();

  if (!isAdminAuthenticated || remainingTime === null) {
    return null;
  }

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const isLow = remainingTime <= 120; // 2 minutes or less
  const isCritical = remainingTime <= 60; // 1 minute or less

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        isCritical 
          ? "bg-destructive/20 text-destructive border border-destructive/30 animate-pulse" 
          : isLow 
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            : "bg-muted/50 text-muted-foreground border border-border"
      )}
    >
      <Clock className="w-4 h-4" />
      <span>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};
