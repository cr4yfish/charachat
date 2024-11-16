"use client";

import { useEffect, useState } from "react";
import { Spacer } from "@nextui-org/spacer";
import { Input } from "@nextui-org/input";

import { Button } from "@/components/utils/Button";
import Icon from "../utils/Icon";
import { Profile } from "@/types/db";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { updateProfile } from "@/functions/db/profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { decryptMessage, encryptMessage } from "@/lib/crypto";

type Props = {
    profile: Profile
}

export default function EditProfile(props: Props) {
    const [profile, setProfile] = useState<Profile>(props.profile);

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // decrypt API Keys
        const key = sessionStorage.getItem('key');

        if(!key) {
            return;
        }

        const keyBuffer = Buffer.from(key, 'hex');

        const profileToEdit: Profile = {
            ...props.profile,
            groq_encrypted_api_key: props.profile.groq_encrypted_api_key && decryptMessage(props.profile.groq_encrypted_api_key, keyBuffer),
            ollama_encrypted_api_key: props.profile.ollama_encrypted_api_key && decryptMessage(props.profile.ollama_encrypted_api_key, keyBuffer),
            openai_encrypted_api_key: props.profile.openai_encrypted_api_key && decryptMessage(props.profile.openai_encrypted_api_key, keyBuffer),
            gemini_encrypted_api_key: props.profile.gemini_encrypted_api_key && decryptMessage(props.profile.gemini_encrypted_api_key, keyBuffer),
            mistral_encrypted_api_key: props.profile.mistral_encrypted_api_key && decryptMessage(props.profile.mistral_encrypted_api_key, keyBuffer),
            anthropic_encrypted_api_key: props.profile.anthropic_encrypted_api_key && decryptMessage(props.profile.anthropic_encrypted_api_key, keyBuffer)
        }

        console.log(profileToEdit)

        setProfile(profileToEdit);

    }, [props.profile])

    const handleUpdate = async () => {
        setIsSaving(true);

        // Encrypt API Keys
        const key = sessionStorage.getItem('key');

        if(!key) {
            console.error("No key found in session storage");
            return;
        }

        const keyBuffer = Buffer.from(key, 'hex');

        const profileToSave: Profile = {
            ...profile,
            groq_encrypted_api_key: profile.groq_encrypted_api_key && encryptMessage(profile.groq_encrypted_api_key, keyBuffer),
            ollama_encrypted_api_key: profile.ollama_encrypted_api_key && encryptMessage(profile.ollama_encrypted_api_key, keyBuffer),
            openai_encrypted_api_key: profile.openai_encrypted_api_key && encryptMessage(profile.openai_encrypted_api_key, keyBuffer),
            gemini_encrypted_api_key: profile.gemini_encrypted_api_key && encryptMessage(profile.gemini_encrypted_api_key, keyBuffer),
            mistral_encrypted_api_key: profile.mistral_encrypted_api_key && encryptMessage(profile.mistral_encrypted_api_key, keyBuffer),
            anthropic_encrypted_api_key: profile.anthropic_encrypted_api_key && encryptMessage(profile.anthropic_encrypted_api_key, keyBuffer)
        }

        try {
            await updateProfile(profileToSave);
        } catch (error) {
            console.error(error);
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
                maxLength={250} 
            />
            <Input 
                label="Avatar Image" 
                description="Provide a direct link to an image (e.g. Upload to Imgur and then post the link here)." 
                placeholder="https://i.imgur.com/Utr8AgMb.jpg"
                value={profile.avatar_link}
                onValueChange={(value) => handleUpdateValue('avatar_link', value)}
            />

            <p className="text-sm dark:text-slate-400">All API Keys are stored encrypted and are only decrypted when viewed or used.</p>
            <Card>
                <CardHeader>
                    <CardDescription>Configure your Ollama LLMs</CardDescription>
                    <CardTitle>Ollama</CardTitle>
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
                    <Input label="Openai API Key" type="text" 
                        value={profile.openai_encrypted_api_key} onValueChange={(value) => handleUpdateValue("openai_encrypted_api_key", value)}
                    />
                    <Input label="Gemini API Key" type="text" 
                        value={profile.gemini_encrypted_api_key} onValueChange={(value) => handleUpdateValue("gemini_encrypted_api_key", value)}
                    />
                    <Input label="Mistral API Key" type="text"
                        value={profile.mistral_encrypted_api_key} onValueChange={(value) => handleUpdateValue("mistral_encrypted_api_key", value)}
                    />
                    <Input label="Anthropic API Key" type="text"
                        value={profile.anthropic_encrypted_api_key} onValueChange={(value) => handleUpdateValue("anthropic_encrypted_api_key", value)}
                    />
                    <Input label="Groq API Key" type="text" 
                        value={profile.groq_encrypted_api_key} onValueChange={(value) => handleUpdateValue("groq_encrypted_api_key", value)}
                    />
                </CardContent>
            </Card>

            <Spacer y={2} />

            <Button
                size="lg" color="primary"
                variant="shadow"
                startContent={<Icon filled>save</Icon>}
                onClick={handleUpdate}
                isLoading={isSaving}
                isDisabled={isDeleting}
            >
                Save
            </Button>
            <SaveDeleteButton 
                onDelete={handleDelete}
                isLoading={isDeleting}
                isDisabled={isSaving}
            />
        </div>
        </>
    )
}