import { HomePage } from "@/components/home/home-page";
import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function ChatsPage() {

    const user = await currentUser();

    if (!user || !user.id) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <SignInButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-screen max-w-screen overflow-hidden mt-[75px] px-4">       
            <HomePage userid={user.id} />
        </div>
    );
}
