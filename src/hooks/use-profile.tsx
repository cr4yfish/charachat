/**
 * Hook that uses useSWR to fetch the profile data.
 */

import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { Profile } from "@/lib/db/types/profile";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";


export const useProfile = () => {
  const { data: profile, mutate, isLoading, isValidating } = useSWR<Profile>(API_ROUTES.GET_OWN_PROFILE, fetcher, {
    refreshInterval: TIMINGS_MILLISECONDS.FIVE_MINUTES,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    keepPreviousData: true, // Keep previous data while loading new data
  });

  return {
    profile,
    mutateProfile: mutate,
    isLoading,
    isValidating,
  };
};