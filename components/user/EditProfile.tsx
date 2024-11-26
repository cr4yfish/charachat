"use client";

import { useEffect, useState } from "react";
import { Spacer } from "@nextui-org/spacer";
import { Input } from "@nextui-org/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/utils/Button";
import Icon from "../utils/Icon";
import { Profile } from "@/types/db";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { updateProfile } from "@/functions/db/profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { LLMsWithAPIKeys } from "@/lib/ai";
import LoginButton from "../auth/LoginButton";

type Props = {
    profile: Profile
}

const KeyInputDescription = ({url, hasFreeTier}: {url: string, hasFreeTier?: boolean}) => (
    <div className="flex flex-row items-center gap-1">
        {hasFreeTier && <span className="text-green-500">Free Tier Available</span>}
        <a
            href={url}
            target="_blank"
            className="text-blue-500 underline"
        >
            Get the key here
        </a>
    </div>
)

export default function EditProfile(props: Props) {
    const [profile, setProfile] = useState<Profile>(props.profile);
    const {toast} = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // decrypt API Keys
        try {
            const key = sessionStorage.getItem('key');

            if(!key) { throw new Error("No key found in session storage");  }

            const keyBuffer = Buffer.from(key, 'hex');

            const profileToEdit: Profile = {
                ...props.profile,
                groq_encrypted_api_key: props.profile.groq_encrypted_api_key && decryptMessage(props.profile.groq_encrypted_api_key, keyBuffer),
                ollama_encrypted_api_key: props.profile.ollama_encrypted_api_key && decryptMessage(props.profile.ollama_encrypted_api_key, keyBuffer),
                openai_encrypted_api_key: props.profile.openai_encrypted_api_key && decryptMessage(props.profile.openai_encrypted_api_key, keyBuffer),
                gemini_encrypted_api_key: props.profile.gemini_encrypted_api_key && decryptMessage(props.profile.gemini_encrypted_api_key, keyBuffer),
                mistral_encrypted_api_key: props.profile.mistral_encrypted_api_key && decryptMessage(props.profile.mistral_encrypted_api_key, keyBuffer),
                anthropic_encrypted_api_key: props.profile.anthropic_encrypted_api_key && decryptMessage(props.profile.anthropic_encrypted_api_key, keyBuffer),
                hf_encrypted_api_key: props.profile.hf_encrypted_api_key && decryptMessage(props.profile.hf_encrypted_api_key, keyBuffer),
                replicate_encrypted_api_key: props.profile.replicate_encrypted_api_key && decryptMessage(props.profile.replicate_encrypted_api_key, keyBuffer)
            }

            setProfile(profileToEdit);
        } catch (error) {
            const err = error as Error;
            console.error(err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

    }, [props.profile, toast])

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            // Encrypt API Keys
            const key = sessionStorage.getItem('key');

            if(!key) {
                throw new Error("No key found in session storage");
            }

            const keyBuffer = Buffer.from(key, 'hex');

            const profileToSave: Profile = {
                ...profile,
                groq_encrypted_api_key: profile.groq_encrypted_api_key && encryptMessage(profile.groq_encrypted_api_key, keyBuffer),
                ollama_encrypted_api_key: profile.ollama_encrypted_api_key && encryptMessage(profile.ollama_encrypted_api_key, keyBuffer),
                openai_encrypted_api_key: profile.openai_encrypted_api_key && encryptMessage(profile.openai_encrypted_api_key, keyBuffer),
                gemini_encrypted_api_key: profile.gemini_encrypted_api_key && encryptMessage(profile.gemini_encrypted_api_key, keyBuffer),
                mistral_encrypted_api_key: profile.mistral_encrypted_api_key && encryptMessage(profile.mistral_encrypted_api_key, keyBuffer),
                anthropic_encrypted_api_key: profile.anthropic_encrypted_api_key && encryptMessage(profile.anthropic_encrypted_api_key, keyBuffer),
                hf_encrypted_api_key: profile.hf_encrypted_api_key && encryptMessage(profile.hf_encrypted_api_key, keyBuffer),
                replicate_encrypted_api_key: profile.replicate_encrypted_api_key && encryptMessage(profile.replicate_encrypted_api_key, keyBuffer)
            }

            await updateProfile(profileToSave);
            toast({
                title: "Success",
                description: "Profile updated successfully",
                variant: "success"
            })
        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

        setIsSaving(false);
    }

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // await deleteProfile(profile);
        } catch (error) {
            console.error(error);
        }

        setIsDeleting(false);
    }

    const handleUpdateValue = (key: string, value: string) => {
        setProfile({...profile, [key]: value});
    }

    return (
        <>
        <div className="flex flex-col gap-2">
            <Input 
                label="Username"
                description="This will be public information and used as a display name on your Characters and Stories. This IS NOT used by the AI."
                isRequired 
                value={profile.username}
                onValueChange={(value) => handleUpdateValue('username', value)} 
            />
            <Input 
                label="First Name"
                description="This will be used by the AI to address you. No one else will see this."
                isRequired 
                value={profile.first_name} 
                onValueChange={(value) => handleUpdateValue('first_name', value)} 
            />
            <Input 
                label="Last Name" 
                description="(Optional) Also only visible to the AI."
                value={profile.last_name} 
                onValueChange={(value) => handleUpdateValue('last_name', value)} 
            />
            <TextareaWithCounter 
                label="Bio"
                isRequired
                description="Tell us about yourself. This will be given to the AI to improve responses." 
                value={profile.bio} 
                onValueChange={(value) => handleUpdateValue('bio', value)} 
                maxLength={2000} 
            />
            <Input 
                label="Avatar Image" 
                description="Provide a direct link to an image (e.g. Upload to Imgur and then post the link here)." 
                placeholder="https://i.imgur.com/Utr8AgMb.jpg"
                value={profile.avatar_link}
                onValueChange={(value) => handleUpdateValue('avatar_link', value)}
            />

            <div className="prose dark:prose-invert">
                <h3>Configure AIs</h3>
                <p className="text-sm dark:text-zinc-400">All API Keys are stored encrypted and are only decrypted when viewed or used. You will be able to select any AI for which you provide an API key in chats - in addition to free models.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardDescription>Configure your Ollama API LLMs</CardDescription>
                    <CardTitle>Ollama type LLM</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Input label="Base URL" description="Your API Link" 
                        value={profile.ollama_base_url} onValueChange={(value) => handleUpdateValue("ollama_base_url", value)}
                    />
                    <Input label="API Key" description="You API Key" type="text" 
                        value={profile.ollama_encrypted_api_key} onValueChange={(value) => handleUpdateValue("ollama_encrypted_api_key", value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Configure hosted LLMs</CardDescription>
                    <CardTitle>API Keys</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Input 
                        label="Openai API Key" type="text" 
                        description={<KeyInputDescription url="https://platform.openai.com/account/api-keys" />}
                        value={profile.openai_encrypted_api_key} onValueChange={(value) => handleUpdateValue("openai_encrypted_api_key", value)}
                    />
                    <Input 
                        label="Gemini API Key" type="text" 
                        description={<KeyInputDescription url="https://aistudio.google.com/apikey" hasFreeTier />}
                        value={profile.gemini_encrypted_api_key} onValueChange={(value) => handleUpdateValue("gemini_encrypted_api_key", value)}
                    />
                    <Input 
                        label="Mistral API Key" type="text"
                        description={<KeyInputDescription url="https://console.mistral.ai/api-keys/" hasFreeTier />}
                        value={profile.mistral_encrypted_api_key} onValueChange={(value) => handleUpdateValue("mistral_encrypted_api_key", value)}
                    />
                    <Input 
                        label="Anthropic API Key" type="text"
                        description={<KeyInputDescription url="https://console.anthropic.com/settings/keys" />}
                        value={profile.anthropic_encrypted_api_key} onValueChange={(value) => handleUpdateValue("anthropic_encrypted_api_key", value)}
                    />
                    <Input 
                        label="Groq API Key" type="text" 
                        description={<KeyInputDescription url="https://console.groq.com/keys" hasFreeTier />}
                        value={profile.groq_encrypted_api_key} onValueChange={(value) => handleUpdateValue("groq_encrypted_api_key", value)}
                    />
                    <Input 
                        label="Huggingface Inference API Key" type="text" 
                        description={<KeyInputDescription url="https://huggingface.co/settings/tokens/new?tokenType=fineGrained" hasFreeTier />}
                        value={profile.hf_encrypted_api_key} onValueChange={(value) => handleUpdateValue("hf_encrypted_api_key", value)}
                    />
                    <Input 
                        label="Replicate API Key (much faster than Huggingface)" type="text" 
                        description={<KeyInputDescription url="https://replicate.com/account/api-tokens" />}
                        value={profile.replicate_encrypted_api_key} onValueChange={(value) => handleUpdateValue("replicate_encrypted_api_key", value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Select which model to use for writing help (e.g. creating stories)</CardDescription>
                    <CardTitle>Choose Author Model</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select 
                        onValueChange={(value) =>  profile && handleUpdateValue('default_llm', value)}
                        defaultValue={profile.default_llm}
                    >
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select an AI" />
                        </SelectTrigger>
                        <SelectContent>
                            {LLMsWithAPIKeys(profile).map((llm) => (
                                <SelectItem key={llm.key} value={llm.key}>{llm.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>


            <Spacer y={2} />
            <div className="flex items-center gap-4 max-w-lg max-md:flex-col max-md:max-w-full">
                <div className="w-fit max-md:w-full">
                    <Button
                        size="lg" color="primary"
                        fullWidth
                        startContent={<Icon filled>save</Icon>}
                        onClick={handleUpdate}
                        isLoading={isSaving}
                        isDisabled={isDeleting}
                    >
                        Save
                    </Button>
                </div>
                <div className="w-fit max-md:w-full">
                    <SaveDeleteButton 
                        onDelete={handleDelete}
                        isLoading={isDeleting}
                        isDisabled={isSaving}
                    />
                </div>
                <div className="w-fit max-md:w-full">
                    <LoginButton 
                        isLoggedIn={profile !== undefined}
                        showLogout
                    />
                </div>
            </div>

       
        </div>
        </>
    )
}