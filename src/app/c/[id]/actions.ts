import { bookmarkCharacter } from "@/lib/db/character";


export async function bookmarkCharacterAction(charId: string): Promise<void> {
    try {
        await bookmarkCharacter(charId);

    } catch (error) {
        console.error("Error bookmarking character:", error);
        throw error;
    }
}