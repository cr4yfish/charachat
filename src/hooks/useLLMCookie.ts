import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { API_ROUTES } from "@/lib/apiRoutes";

function useLLMCookie() {
  const { data: llmCookie } = useSWR(API_ROUTES.LLM_COOKIE, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
  });

  return {llmCookie};
}

export default useLLMCookie;