import SavedCharacters from "@/components/home/saved-characters";
import { YourCharacters } from "@/components/home/your-characters";
import { YourProfile } from "@/components/home/your-profile";
import { getUserCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/constants/limits";
import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { YourPersonas } from "@/components/home/your-personas";
import { getOwnPersonas } from "@/lib/db/persona";

export default async function ChatsPage() {

    const user = await currentUser();

    if (!user || !user.id) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <SignInButton />
            </div>
        );
    }

    const initialOwnCharacters = await getUserCharacters({
        cursor: 0,
        limit: LIMITS.MAX_CHARACTERS_PER_PAGE
    })

    const initialOwnPersonas = await getOwnPersonas({
        cursor: 0,
        limit: LIMITS.MAX_PERSONAS_PER_PAGE
    })

    return (
        <div className=" h-screen max-w-screen overflow-x-hidden overflow-y-auto ios-safe-header-padding-chats pb-[100px] px-4 flex flex-col items-center">     
            
            <div className="flex flex-col gap-4 w-full h-fit max-w-3xl">
                
            
                <YourProfile userid={user.id} />

                <YourCharacters initialOwnCharacters={initialOwnCharacters} />

                <YourPersonas initOwnPersonas={initialOwnPersonas} />

                <SavedCharacters />

            </div>
        </div>
    );
}
