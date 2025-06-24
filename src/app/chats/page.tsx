import Chats from "@/components/chats/chats";
import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";


export default async function ChatsPage() {

    const user = await currentUser();

    if(!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <SignInButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <Chats />
        </div>
    );
}
