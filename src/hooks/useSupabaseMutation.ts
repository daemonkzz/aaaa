import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

type MutationType = 'insert' | 'update' | 'delete' | 'upsert';

interface MutationOptions<T> {
  table: string;
  type: MutationType;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface MutationResult<T> {
  mutate: (data: Partial<T>, filter?: { column: string; value: unknown }) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Generic hook for Supabase mutations with consistent error handling
 */
export function useSupabaseMutation<T extends Record<string, unknown>>({
  table,
  type,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: MutationOptions<T>): MutationResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const log = logger.scope(`useSupabaseMutation:${table}`);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const mutate = useCallback(
    async (data: Partial<T>, filter?: { column: string; value: unknown }): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        switch (type) {
          case 'insert': {
            const { data: insertData, error: insertError } = await supabase
              .from(table)
              .insert(data)
              .select()
              .single();
            
            if (insertError) throw new Error(insertError.message);
            result = insertData;
            break;
          }

          case 'update': {
            if (!filter) throw new Error('Filter required for update operation');
            
            const { data: updateData, error: updateError } = await supabase
              .from(table)
              .update(data)
              .eq(filter.column, filter.value)
              .select()
              .single();
            
            if (updateError) throw new Error(updateError.message);
            result = updateData;
            break;
          }

          case 'delete': {
            if (!filter) throw new Error('Filter required for delete operation');
            
            const { error: deleteError } = await supabase
              .from(table)
              .delete()
              .eq(filter.column, filter.value);
            
            if (deleteError) throw new Error(deleteError.message);
            result = data;
            break;
          }

          case 'upsert': {
            const { data: upsertData, error: upsertError } = await supabase
              .from(table)
              .upsert(data)
              .select()
              .single();
            
            if (upsertError) throw new Error(upsertError.message);
            result = upsertData;
            break;
          }
        }

        log.info(`${type} successful`, { table });
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess && result) {
          onSuccess(result as T);
        }

        return result as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        log.error(`${type} failed`, error);

        const message = errorMessage || `${table} işlemi başarısız oldu`;
        toast.error(message);
        
        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [table, type, onSuccess, onError, successMessage, errorMessage]
  );

  return {
    mutate,
    isLoading,
    error,
    reset,
  };
}

export default useSupabaseMutation;
