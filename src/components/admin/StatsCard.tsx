import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    icon: 'text-primary bg-primary/10',
    value: 'text-foreground',
  },
  success: {
    icon: 'text-emerald-400 bg-emerald-500/10',
    value: 'text-emerald-400',
  },
  warning: {
    icon: 'text-amber-400 bg-amber-500/10',
    value: 'text-amber-400',
  },
  danger: {
    icon: 'text-red-400 bg-red-500/10',
    value: 'text-red-400',
  },
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
}: StatsCardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className={cn('text-3xl font-bold', styles.value)}>{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', styles.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
