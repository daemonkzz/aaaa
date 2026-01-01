import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

/**
 * Error fallback component for error boundaries
 * Displays a user-friendly error message with recovery options
 */
export const ErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'Bir şeyler yanlış gitti',
  description = 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.',
  showHomeButton = true,
}: ErrorFallbackProps) => {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {/* Error Details (Dev only) */}
        {import.meta.env.DEV && error && (
          <div className="p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-40">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs font-mono text-muted-foreground mt-2 whitespace-pre-wrap break-all">
                {error.stack.split('\n').slice(1, 5).join('\n')}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={handleRefresh} variant="default" className="gap-2 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4" />
            Yenile
          </Button>
          {showHomeButton && (
            <Button onClick={handleGoHome} variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Ana Sayfa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
