"use client";

import { memo, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import LLMBadge from "../llm/llm-badge";
import LLMIcon from "../llm/llm-icon";
import { LLMs } from "@/lib/ai/models/llm/text-models";
import { InputWithLabel } from "../ui/input-with-label";
import { Providers } from "@/lib/ai/models/providers/providers";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/apiRoutes";
import { useDebounce } from "use-debounce";
import { ProviderId } from "@/lib/ai/types";
import { toast } from "sonner";
import { Profile } from "@/types/db";
import { fetcher } from "@/lib/utils";
import equal from 'fast-deep-equal';
import Spinner from "../ui/spinner";
import { CheckIcon } from "lucide-react";
import { TIMINGS_MILLISECONDS } from "@/lib/timings";

const PureAPIKeyInputCard = () => {
    const { data: profile, mutate, isLoading, isValidating, } = useSWR<Profile>(API_ROUTES.GET_OWN_PROFILE, fetcher, {
      dedupingInterval: TIMINGS_MILLISECONDS.ONE_MINUTE,
      refreshInterval: TIMINGS_MILLISECONDS.ONE_MINUTE,
      revalidateOnMount: true,
    })
    const [debouncedProfile] = useDebounce(profile, 1000);
    const isChanged = useMemo(() => {
      if (!profile || !debouncedProfile) return false;
      return !equal(profile, debouncedProfile);
    }, [profile, debouncedProfile]);

    useEffect(() => {
      if(!debouncedProfile) return;

      // only update if the profile has changed
      if(!isChanged) return;

      fetch(API_ROUTES.UPDATE_PROFILE, {
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
        toast.success("Profile updated successfully");
        // mutate(profile, true); // Revalidate the profile data
      })
      .catch(error => {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again later.");
      });

    }, [debouncedProfile, mutate, isChanged])

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
      mutate(updatedProfile, {
        optimisticData: updatedProfile,
        revalidate: false,
      }); // Optimistically update the profile
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>All API Keys are stored encrypted and are only decrypted when viewed or used. You will be able to use any AI for which you provide an API key - in addition to free models.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2 text-muted-foreground text-xs">
            {isLoading || isValidating && <Spinner />}
            {isLoading && <p>Loading your profile...</p>}
            {isValidating && <p>Syncing with your profile...</p>}
            {!isLoading && !isValidating && profile && <p>Profile loaded. You can now manage your API keys.</p>}
            {!profile && !isLoading && !isValidating && <p className="text-red-500">Failed to load profile. Please try again later.</p>}
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

              {Providers.map(provider => (
                <AccordionItem value={provider.id} key={provider.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LLMIcon provider={provider.id} />
                      {provider.id}
                      {provider.hasFreeTier && <span className="text-xs text-green-500">Free Tier available</span>}
                      {profile?.api_keys?.some(key => key.provider === provider.id) &&
                        <span className="text-xs text-emerald-400">
                          <CheckIcon size={12} />
                        </span>
                      }
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className=" text-muted-foreground text-xs">{provider.id} Models</span>
                      <div className="flex flex-row gap-1 flex-wrap">
                        {LLMs.filter(model => model.provider === provider.id).map(model => 
                          <LLMBadge 
                            llm={model} 
                            key={model.key} 
                            isActive={profile?.api_keys?.some(key => key.provider === provider.id)}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <InputWithLabel 
                        label="API Key"
                        description="Enter your API key for this provider. This key will be stored encrypted and used to access the provider's models."
                        placeholder={`${provider.id} API Key`}
                        type="password"
                        value={profile?.api_keys?.find(key => key.provider === provider.id)?.encrypted_api_key || ""}
                        onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                        disabled={isLoading}
                      />
                      {provider.keyLink && <a className="text-blue-400 underline text-xs" href={provider.keyLink}>Get the key here</a>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}

          </Accordion>

        </CardContent>
      </Card>
    )
}

const APIKeyInputCard = memo(PureAPIKeyInputCard, () => {
  return true;
});

export default APIKeyInputCard;