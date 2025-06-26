/**
 * Hook that uses useSWR to fetch the profile data.
 * Optimized for better data freshness and user experience.
 */

import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { Profile } from "@/lib/db/types/profile";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";
import { useCallback } from "react";


export const useProfile = () => {
  const { data: profile, mutate, isLoading, isValidating, error } = useSWR<Profile>(
    API_ROUTES.GET_OWN_PROFILE, 
    fetcher, 
    {
      // Refresh more frequently for better UX
      refreshInterval: TIMINGS_MILLISECONDS.ONE_MINUTE,
      revalidateIfStale: true, // Allow revalidation if data is stale
      revalidateOnFocus: true, // Revalidate when user returns to tab
      revalidateOnReconnect: true, // Revalidate when reconnecting to network
      revalidateOnMount: true, // Fetch data on mount if not cached
      keepPreviousData: true, // Keep previous data while fetching new
      dedupingInterval: 500, // Reduce deduping interval for more responsive updates
      errorRetryCount: 3,
      errorRetryInterval: 1000, // Fixed retry interval for now
      shouldRetryOnError: (error: Error) => {
        // Don't retry on 4xx errors (client errors), but retry on network/server errors
        const status = (error as Error & { status?: number })?.status;
        return status ? status >= 500 : true;
      },
      // Enable background revalidation for better UX
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      focusThrottleInterval: 5000, // Throttle focus revalidation to every 5 seconds
    }
  );

  // Manual refresh function that bypasses cache
  const refreshProfile = useCallback(async (optimisticData?: Profile) => {
    if (optimisticData) {
      // Optimistic update - immediately show new data, don't revalidate yet
      await mutate(optimisticData, { revalidate: false });
    }
    // Then revalidate from server
    return mutate();
  }, [mutate]);

  // Force refresh that clears cache and refetches
  const forceRefresh = useCallback(() => {
    return mutate(undefined, { revalidate: true });
  }, [mutate]);

  return {
    profile,
    mutateProfile: mutate,
    refreshProfile,
    forceRefresh,
    isLoading,
    isValidating,
    error,
    // Helper to check if profile exists
    hasProfile: !!profile,
    // Helper to check if we're in an error state
    isError: !!error,
  };
};