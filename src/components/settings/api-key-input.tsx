"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { InputWithLabel } from "../ui/input-with-label";
import Spinner from "../ui/spinner";
import { useProfile } from "@/hooks/use-profile";
import { ProviderId } from "@/lib/ai/models/providers";
import { useDebounce } from "use-debounce";
import equal from "fast-deep-equal";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { Providers } from "@/lib/ai/models/providers";

type Props = {
  providerId: ProviderId | undefined;
}

const PureAPIKeyInput = ({ providerId }: Props) => {
  const provider = useMemo(() => {
    return providerId ? Providers.find(p => p.id === providerId) : null;
  }, [providerId]);
  const { profile, isLoading, isValidating } = useProfile();
  const [internalKey, setInternalKey] = useState<string | undefined>(undefined);
  const [debouncedKey] = useDebounce(internalKey, 1000);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!provider) return;
    // Reset the internal key if the provider changes
    const existingKey = profile?.api_keys?.find(key => key.provider === provider.id)?.encrypted_api_key || "";
    setInternalKey(existingKey);
  }, [provider, setInternalKey, profile?.api_keys]);

  useEffect(() => {
    if(equal(debouncedKey, profile?.api_keys?.find(key => key.provider === provider?.id)?.encrypted_api_key)) {
      setIsUpdating(false);
      return;
    }
    if (!debouncedKey || !provider) return;

    setIsUpdating(true);

    fetch(API_ROUTES.UPDATE_PROFILE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...profile,
        api_keys: [
          ...(profile?.api_keys || []).filter(key => key.provider !== provider?.id),
          { provider: provider?.id, encrypted_api_key: debouncedKey }
        ]
      }),
    })

  }, [debouncedKey, provider, profile]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex flex-col">
        <InputWithLabel 
          label="API Key"
          description="Enter your API key for this provider. This key will be stored encrypted and used to access the provider's models."
          placeholder={`${provider?.id} API Key`}
          type="password"
          value={internalKey || ""}
          onChange={(e) => setInternalKey(e.target.value)}
          disabled={isUpdating || isLoading}
        />
        {(isUpdating || isLoading || isValidating) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Spinner size="small" />
            <span>Syncing...</span>
          </div>
        )}
      </div>
      {provider?.keyLink && (
        <a 
          className={`text-blue-400 underline text-xs`} 
          href={provider.keyLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get the key here
        </a>
      )}
    </div>
    )
};

const APIKeyInput = memo(PureAPIKeyInput, (prev, next) => {
  // Only re-render if the providerId changes
  return prev.providerId === next.providerId
});

export default APIKeyInput;