"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";

import { Button } from "@/components/utils/Button";
import Icon from "../utils/Icon";
import { Profile } from "@/types/db";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { updateProfile } from "@/functions/db/profiles";

type Props = {
    profile: Profile
}

export default function EditProfile(props: Props) {
    const [profile, setProfile] = useState<Profile>(props.profile);

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async () => {
        setIsSaving(true);

        try {
            await updateProfile(profile);
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

    return (
        <>
        <div className="flex flex-col gap-2">
            <Input 
                label="Username"
                description="This will be public information and used as a display name on your Characters and Stories. This IS NOT used by the AI."
                isRequired 
                value={profile.username}
                onValueChange={(value) => setProfile({...profile, username: value})} 
            />
            <Input 
                label="First Name"
                description="This will be used by the AI to address you. No one else will see this."
                isRequired 
                value={profile.first_name} 
                onValueChange={(value) => setProfile({...profile, first_name: value})} 
            />
            <Input 
                label="Last Name" 
                description="(Optional) Also only visible to the AI."
                value={profile.last_name} 
                onValueChange={(value) => setProfile({...profile, last_name: value})} 
            />
            <TextareaWithCounter 
                label="Bio"
                isRequired
                description="Tell us about yourself. This will be given to the AI to improve responses." 
                value={profile.bio} 
                onValueChange={(value) => setProfile({...profile, bio: value})} 
                maxLength={250} 
            />
            <Input 
                label="Avatar Image" 
                description="Provide a direct link to an image (e.g. Upload to Imgur and then post the link here)." 
                placeholder="https://i.imgur.com/Utr8AgMb.jpg"
                value={profile.avatar_link}
                onValueChange={(value) => setProfile({...profile, avatar_link: value})}
            />

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