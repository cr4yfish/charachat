/**
 * Hook that uses the `useSWR` hook to fetch chat data from the server.
 */


"use client";

import { Chat } from "@/lib/db/types/chat";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";

export function useChats(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<Chat[]>(
    API_ROUTES.GET_CHATS +  `?limit=${limit}`,
    fetcher,
    {
      refreshInterval: TIMINGS_MILLISECONDS.FIVE_MINUTES,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      keepPreviousData: true, // Keep previous data while loading new data
    }
  );

  return {
    chats: data,
    isLoading,
    error,
    mutate,
  };
}