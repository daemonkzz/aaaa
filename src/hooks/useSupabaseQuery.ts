import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface UseSupabaseQueryOptions<T> {
  table: string;
  select?: string;
  filter?: {
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
    value: unknown;
  }[];
  order?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  single?: boolean;
  enabled?: boolean;
  transform?: (data: unknown[]) => T[];
}

interface UseSupabaseQueryResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for Supabase queries with consistent error handling
 */
export function useSupabaseQuery<T>({
  table,
  select = '*',
  filter = [],
  order,
  limit,
  single = false,
  enabled = true,
  transform,
}: UseSupabaseQueryOptions<T>): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const log = logger.scope(`useSupabaseQuery:${table}`);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(select);

      // Apply filters
      for (const f of filter) {
        switch (f.operator) {
          case 'eq':
            query = query.eq(f.column, f.value);
            break;
          case 'neq':
            query = query.neq(f.column, f.value);
            break;
          case 'gt':
            query = query.gt(f.column, f.value);
            break;
          case 'gte':
            query = query.gte(f.column, f.value);
            break;
          case 'lt':
            query = query.lt(f.column, f.value);
            break;
          case 'lte':
            query = query.lte(f.column, f.value);
            break;
          case 'like':
            query = query.like(f.column, f.value as string);
            break;
          case 'ilike':
            query = query.ilike(f.column, f.value as string);
            break;
          case 'in':
            query = query.in(f.column, f.value as unknown[]);
            break;
        }
      }

      // Apply ordering
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      // Execute query
      let result: unknown[];
      
      if (single) {
        const { data: singleData, error: queryError } = await query.maybeSingle();
        if (queryError) {
          throw new Error(queryError.message);
        }
        result = singleData ? [singleData] : [];
      } else {
        const { data: multiData, error: queryError } = await query;
        if (queryError) {
          throw new Error(queryError.message);
        }
        result = (multiData || []) as unknown[];
      }

      // Transform data if transformer provided
      const transformedData = transform ? transform(result) : (result as T[]);
      
      setData(transformedData);
      log.debug('Query successful', { count: transformedData.length });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      log.error('Query failed', error);
    } finally {
      setIsLoading(false);
    }
  }, [table, select, JSON.stringify(filter), JSON.stringify(order), limit, single, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export default useSupabaseQuery;
