"use client";

import { useEffect, useState } from "react";
import { Spacer } from "@nextui-org/spacer";
import { Input } from "@nextui-org/input";
import { useToast } from "@/hooks/use-toast";
import { Chip } from "@nextui-org/chip";
import { Button } from "@/components/utils/Button";
import Icon from "../utils/Icon";
import { Profile } from "@/types/db";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { deleteUser, updateProfile } from "@/functions/db/profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { LLMs, ProviderId } from "@/lib/ai";
import LoginButton from "../auth/LoginButton";
import ImageInputWithAI from "../ImageInputWithAI";
import { Separator } from "../ui/separator";
import LLMSelect from "../LLMSelect";

type KeyInputProps = {
    url: string,
    hasFreeTier?: boolean,
    value?: string | undefined,
    onValueChange: (value: string) => void,
    label: string;
    provider: ProviderId;
}

const KeyInput = (props: KeyInputProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row flex-wrap items-center gap-2">
                {LLMs.filter(llm => llm.provider === props.provider).map(llm => (<Chip key={llm.key} size="sm" color={props.value ? "success" : "default"}>{llm.name}</Chip>))}
            </div>
            <Input 
                label={props.label} 
                type={isVisible ? "text" : "password"} 
                color={props.value ? "success" : "default"}
                description={<KeyInputDescription url={props.url} hasFreeTier={props.hasFreeTier} />}
                value={props.value} onValueChange={props.onValueChange}
                endContent={
                    <Button 
                        onClick={() => setIsVisible(!isVisible)} 
                        isIconOnly 
                        variant="light"
                        >
                        <Icon color="zinc-400">
                            {isVisible ? "visibility" : "visibility_off"}
                        </Icon>
                    </Button>
                }
            />
        </div>
    )
}

const KeyInputDescription = ({url, hasFreeTier}: {url: string, hasFreeTier?: boolean}) => (
    <div className="flex flex-row items-center gap-1">
        <a
            href={url}
            target="_blank"
            className="text-blue-500 underline"
        >
            Get the key here
        </a>
        {hasFreeTier && <span className="text-green-500">Free Tier Available</span>}
    </div>
)

type Props = {
    profile: Profile
}

export default function EditProfile(props: Props) {
    const [profile, setProfile] = useState<Profile>(props.profile);
    const {toast} = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // decrypt API Keys
        try {
            const key = sessionStorage.getItem('key');

            if(!key) { throw new Error("No key found in session storage. Log out and back in to fix this.");  }

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
                replicate_encrypted_api_key: props.profile.replicate_encrypted_api_key && decryptMessage(props.profile.replicate_encrypted_api_key, keyBuffer),
                cohere_encrypted_api_key: props.profile.cohere_encrypted_api_key && decryptMessage(props.profile.cohere_encrypted_api_key, keyBuffer),
                fal_gpt_encrypted_api_key: props.profile.fal_gpt_encrypted_api_key && decryptMessage(props.profile.fal_gpt_encrypted_api_key, keyBuffer),
                x_ai_encrypted_api_key: props.profile.x_ai_encrypted_api_key && decryptMessage(props.profile.x_ai_encrypted_api_key, keyBuffer),
                openrouter_encrypted_api_key: props.profile.openrouter_encrypted_api_key && decryptMessage(props.profile.openrouter_encrypted_api_key, keyBuffer),
                openrouter_model: props.profile.openrouter_model && decryptMessage(props.profile.openrouter_model, keyBuffer),
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
                throw new Error("No key found in session storage. Log out and back in to fix this.");
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
                replicate_encrypted_api_key: profile.replicate_encrypted_api_key && encryptMessage(profile.replicate_encrypted_api_key, keyBuffer),
                cohere_encrypted_api_key: profile.cohere_encrypted_api_key && encryptMessage(profile.cohere_encrypted_api_key, keyBuffer),
                fal_gpt_encrypted_api_key: profile.fal_gpt_encrypted_api_key && encryptMessage(profile.fal_gpt_encrypted_api_key, keyBuffer),
                x_ai_encrypted_api_key: profile.x_ai_encrypted_api_key && encryptMessage(profile.x_ai_encrypted_api_key, keyBuffer),
                openrouter_encrypted_api_key: profile.openrouter_encrypted_api_key && encryptMessage(profile.openrouter_encrypted_api_key, keyBuffer),
                openrouter_model: profile.openrouter_model && encryptMessage(profile.openrouter_model, keyBuffer),
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
            await deleteUser();
            window.location.reload();
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
            <ImageInputWithAI
                contextFields={[profile.first_name, profile.last_name ?? "", profile.bio ?? ""]}
                imageLink={profile.avatar_link}
                setImageLink={(value) => handleUpdateValue('avatar_link', value)}
            />

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
            
            <Separator className="mt-4" />

            <div className="prose dark:prose-invert prose-h2:text-3xl">
                <h2>Settings</h2>
            </div>

            <div className="prose dark:prose-invert">
                <h3>Configure AIs</h3>
                <p className="text-sm dark:text-zinc-400">All API Keys are stored encrypted and are only decrypted when viewed or used. You will be able to use any AI for which you provide an API key - in addition to free models.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardDescription>Configure hosted LLMs</CardDescription>
                    <CardTitle>API Keys</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <h3>Free models</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip color="success">Mistral Nemo</Chip>
                        <Chip color="success">xAI Grok</Chip>
                        <Chip color="success">Llama 3.2 90b</Chip>
                        <Chip color="success">Llama 3 70b</Chip>
                        <Chip color="success">Genma 2</Chip>
                    </div>
                    <Separator className="my-2" />
                    
                    <h3>LLMs (Text)</h3>
                    
                    <KeyInput 
                        url="https://platform.openai.com/account/api-keys" 
                        label="OpenAI"
                        provider={"OpenAI"}
                        value={profile.openai_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("openai_encrypted_api_key", value)}
                    />
                    <KeyInput 
                        url="https://aistudio.google.com/apikey" 
                        hasFreeTier
                        label="Gemini"
                        provider={"Gemini"}
                        value={profile.gemini_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("gemini_encrypted_api_key", value)}
                    />
                    <KeyInput 
                        url="https://console.mistral.ai/api-keys" 
                        hasFreeTier
                        label="Mistral"
                        provider={"Mistral"}
                        value={profile.mistral_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("mistral_encrypted_api_key", value)}
                    />
                    <KeyInput 
                        url="https://console.x.ai" 
                        hasFreeTier
                        label="Grok"
                        provider={"xAI"}
                        value={profile.x_ai_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("x_ai_encrypted_api_key", value)}
                    />
                    <KeyInput 
                        url="https://console.anthropic.com/settings/keys" 
                        label="Anthropic"
                        provider={"Anthropic"}
                        value={profile.anthropic_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("anthropic_encrypted_api_key", value)}
                    />
                    <KeyInput 
                        url="https://console.groq.com/keys" 
                        label="Groq"
                        hasFreeTier
                        provider={"Groq"}
                        value={profile.groq_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("groq_encrypted_api_key", value)}
                    />
                    <KeyInput 
                        url="https://dashboard.cohere.com/api-keys" 
                        label="Cohere"
                        provider={"Cohere"}
                        value={profile.cohere_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("cohere_encrypted_api_key", value)}
                    />
                    <Separator className="my-2" />
                    <h3>Images</h3>
                    <KeyInput 
                        url="https://huggingface.co/settings/tokens/new?tokenType=fineGrained" 
                        hasFreeTier
                        label="Huggingface"
                        provider={"Huggingface"}
                        value={profile.hf_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("hf_encrypted_api_key", value)}
                    />
                    <Separator className="my-2" />
                    <h3>Images & Voice</h3>
                    <KeyInput 
                        url="https://replicate.com/account/api-tokens" 
                        hasFreeTier
                        label="Replicate"
                        provider={"Replicate"}
                        value={profile.replicate_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("replicate_encrypted_api_key", value)}
                    />
                    <Separator className="my-2" />
                    <h3>Videos</h3>
                    <KeyInput 
                        url="https://fal.ai/dashboard/keys" 
                        hasFreeTier
                        label="FAL AI"
                        provider={"FAL"}
                        value={profile.fal_gpt_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("fal_gpt_encrypted_api_key", value)}
                    />
                </CardContent>
            </Card>

            <div className="prose dark:prose-invert">
                <h3>Advanced AI</h3>
                <p className="text-sm dark:text-zinc-400">If you have a self hosted version of an AI, or want to integrate any model from somewhere else, you can configure it here. For example, you can use any Model from <a href="https://openrouter.ai" target="_blank" className="text-blue-500 underline">Open Router</a> or even host <a href="https://ollama.com/" target="_blank" className="text-blue-500 underline">Ollama</a> yourself.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardDescription>Configure any Model hosted on Open Router</CardDescription>
                    <CardTitle>Open Router</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Input label="Model Name" description="The complete Model string. You can copy this directly from the Model page on Open Router" 
                        placeholder="nousresearch/hermes-3-llama-3.1-405b"
                        value={profile.openrouter_model} onValueChange={(value) => handleUpdateValue("openrouter_model", value)}
                    />
                    <KeyInput 
                        url="https://openrouter.ai/settings/keys" 
                        label="Open Router API Key"
                        provider={"OpenRouter"}
                        value={profile.openrouter_encrypted_api_key} 
                        onValueChange={(value) => handleUpdateValue("openrouter_encrypted_api_key", value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Configure your self hosted Ollama</CardDescription>
                    <CardTitle>Ollama API compatible LLMs</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Input label="URL" description="Where you host Ollama. Most likely http://localhost:somePort" 
                        value={profile.ollama_base_url} onValueChange={(value) => handleUpdateValue("ollama_base_url", value)}
                    />
                    <Input label="API Key" description="You API Key. Leave empty of your self host doesn't need it." type="text" 
                        value={profile.ollama_encrypted_api_key} onValueChange={(value) => handleUpdateValue("ollama_encrypted_api_key", value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Select which model to use for writing help (e.g. generating descriptions, summarizing text)</CardDescription>
                    <CardTitle>Choose Author Model</CardTitle>
                </CardHeader>
                <CardContent>
                    <LLMSelect  
                        default={profile.default_llm}
                        onSelect={(value) => handleUpdateValue('default_llm', value)}
                        user={profile}
                    />
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
                        label="Delete Account"
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