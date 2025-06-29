"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import LLMBadge from "../llm/llm-badge";
import LLMIcon from "../llm/llm-icon";
import { LLMs } from "@/lib/ai/models/llm";
import { InputWithLabel } from "../ui/input-with-label";
import { Providers } from "@/lib/ai/models/providers";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { useDebounce } from "use-debounce";
import { ProviderId } from "@/lib/ai/models/providers";
import { toast } from "sonner";
import { Profile } from "@/lib/db/types/profile";
import equal from 'fast-deep-equal';
import Spinner from "../ui/spinner";
import { CheckIcon } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { imageModels } from "@/lib/ai/models/image";

const PureAPIKeyInputCard = () => {
    const { profile, mutateProfile, isLoading, isValidating, } = useProfile();
    const [debouncedProfile] = useDebounce(profile, 1000);
    const initialProfileRef = useRef<Profile | null>(null);
    const hasInitializedRef = useRef(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Store the initial profile data on first load
    useEffect(() => {
      if (profile && !hasInitializedRef.current) {
        initialProfileRef.current = profile;
        hasInitializedRef.current = true;
      }
    }, [profile]);    useEffect(() => {
      // Don't update if we don't have a debounced profile
      if (!debouncedProfile) return;
      
      // Don't update if we haven't initialized yet (prevents initial load updates)
      if (!hasInitializedRef.current) return;
      
      // Don't update if the profile hasn't actually changed from the initial state
      if (initialProfileRef.current && equal(debouncedProfile, initialProfileRef.current)) {
        return;
      }

      setIsUpdating(true);

      const updatingProfile = fetch(API_ROUTES.UPDATE_PROFILE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debouncedProfile),
      })
      .then(res => {
        if(!res.ok) {
          throw new Error("Failed to update profile");
        }
        return res.json();
      })
      .then(() => {
        // Update the initial profile reference to the new state to prevent further unnecessary updates
        initialProfileRef.current = debouncedProfile;
      })
      .catch(error => {
        console.error("Error updating profile:", error);
      })
      .finally(() => {
        setIsUpdating(false);
      });

      toast.promise(updatingProfile, {
        loading: "Updating profile...",
        success: "Profile updated successfully",
        error: "Failed to update profile. Please try again later.",
      });

    }, [debouncedProfile, mutateProfile])

    const handleKeyChange = (providerId: ProviderId, key: string) => {
      if (!profile) {
        console.error("Profile is not loaded yet");
        return;
      }

      const updatedProfile = {
        ...profile,
        api_keys: [
          ...(profile.api_keys || []).filter(key => key.provider !== providerId),
          {
            provider: providerId,
            encrypted_api_key: key,
          }
        ]
      };
      mutateProfile(updatedProfile, {
        optimisticData: updatedProfile,
        revalidate: false,
      }); // Optimistically update the profile
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>All API Keys are stored encrypted and are only decrypted when viewed or used. You will be able to use any AI for which you provide an API key - in addition to free models.</CardDescription>
        </CardHeader>        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2 text-muted-foreground text-xs">
            {(isLoading || isValidating || isUpdating) && <Spinner />}
            {isLoading && <p>Loading your profile...</p>}
            {isValidating && !isUpdating && <p>Syncing with your profile...</p>}
            {isUpdating && <p>Saving changes...</p>}
            {!isLoading && !isValidating && !isUpdating && profile && <p>Profile loaded. You can now manage your API keys.</p>}
            {!profile && !isLoading && !isValidating && !isUpdating && <p className="text-red-500">Failed to load profile. Please try again later.</p>}
          </div>
          <Accordion type="single" collapsible>
              <AccordionItem value="free-models">
                <AccordionTrigger>Free models</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs">The following models are free to use and do not require an API key. They are provided by various providers and may have different limitations or capabilities.</p>
                  <div className="flex flex-row gap-1 flex-wrap">
                    {LLMs.filter(model => model.isFree).map(model => (
                      <LLMBadge llm={model} key={model.key} isActive />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>              
              {Providers.map(provider => {
                const hasApiKey = profile?.api_keys?.some(key => key.provider === provider.id && key.encrypted_api_key.length > 1);
                const isProviderDisabled = isLoading || isUpdating;
                
                return (
                <AccordionItem value={provider.id} key={provider.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LLMIcon provider={provider.id} />
                      <span className={isProviderDisabled ? "text-muted-foreground" : ""}>{provider.id}</span>
                      {provider.hasFreeTier && <span className="text-xs text-green-500">Free Tier available</span>}
                      {hasApiKey && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckIcon size={12} />
                          {isUpdating && <Spinner size="small" />}
                        </span>
                      )}
                      {isValidating && !isUpdating && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <Spinner size="small" />
                          <span>Syncing</span>
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">{provider.id} Models</span>
                      <div className="flex flex-row gap-1 flex-wrap">
                        {LLMs.filter(model => model.provider === provider.id).map(model => 
                          <LLMBadge 
                            llm={model} 
                            key={model.key} 
                            isActive={hasApiKey}
                            type="text"
                          />
                        )}
                        {imageModels.filter(model => model.provider === provider.id).map(model => 
                          <LLMBadge
                            llm={model}
                            key={model.id}
                            isActive={hasApiKey}
                            type="image"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <InputWithLabel 
                          label="API Key"
                          description="Enter your API key for this provider. This key will be stored encrypted and used to access the provider's models."
                          placeholder={`${provider.id} API Key`}
                          type="password"
                          value={profile?.api_keys?.find(key => key.provider === provider.id)?.encrypted_api_key || ""}
                          onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                          disabled={isProviderDisabled}
                        />
                        {isUpdating && (
                          <div className="absolute right-2 top-8 flex items-center gap-1 text-xs text-muted-foreground">
                            <Spinner size="small" />
                            <span>Saving...</span>
                          </div>
                        )}
                      </div>
                      {provider.keyLink && (
                        <a 
                          className={`text-blue-400 underline text-xs ${isProviderDisabled ? 'pointer-events-none opacity-50' : ''}`} 
                          href={provider.keyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get the key here
                        </a>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                )
              })}

          </Accordion>

        </CardContent>
      </Card>
    )
}

const APIKeyInputCard = memo(PureAPIKeyInputCard, () => {
  return true;
});

export default APIKeyInputCard;