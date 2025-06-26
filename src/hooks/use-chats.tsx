/**
 * Hook that uses the `useSWR` hook to fetch chat data from the server.
 */


"use client";

import { Chat } from "@/lib/db/types/chat";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export function useChats(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<Chat[]>(
    API_ROUTES.GET_CHATS +  `?limit=${limit}`,
    fetcher
  );

  return {
    chats: data,
    isLoading,
    error,
    mutate,
  };
}