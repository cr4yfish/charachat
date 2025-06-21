import { YourCharacters } from "./your-characters";
import { SavedCharacters } from "./saved-characters";
import { YourProfile } from "./your-profile";


export const PureHomePage = async ({ userid }: { userid: string }) => {

    
    return (
        <>
        <div className="flex flex-col gap-4">
            <YourProfile userid={userid} />

            <YourCharacters />

            <SavedCharacters />
        </div>
        </>
    )
}

export const HomePage = PureHomePage