import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { LLM } from "@/lib/ai/models/llm";

function useLLMCookie(defaultLLM?: LLM) {
  const { data: llmCookie } = useSWR<LLM>(API_ROUTES.LLM_COOKIE, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    fallbackData: defaultLLM,
  });

  return {llmCookie};
}

export default useLLMCookie;