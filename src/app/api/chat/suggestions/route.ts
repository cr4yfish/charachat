/**
 * Generate suggestions based on chat context
 */

import { generateSuggestions } from "@/lib/ai/suggestions";
import { getKeyServerSide } from "@/lib/crypto/server";
import { getCharacter } from "@/lib/db/character";
import { getChat } from "@/lib/db/chat";
import { getLatestChatMessage } from "@/lib/db/messages";
import { getProfile } from "@/lib/db/profile";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { currentUser } from "@clerk/nextjs/server";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chat-id')?.valueOf() || '';

    try {
        const chat = await getChat(chatId);
        if (!chat) {
            return new Response(JSON.stringify({ error: ERROR_MESSAGES.CHAT_NOT_FOUND }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const user = await currentUser();

        if (!user) {
            return new Response(JSON.stringify({ error: ERROR_MESSAGES.USER_MESSAGE_NOT_FOUND }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const profile = await getProfile(user.id);

        const character = await getCharacter(chat.character.id);

        const key = await getKeyServerSide();

        // 
        const recentMessages = await getLatestChatMessage(chat.id, key, 3)

        // Simulate fetching suggestions based on the query
        const suggestions = await generateSuggestions({
            chat, userProfile: profile,
            character: character,
            recentMessages
        });

        return Response.json(suggestions);

    } catch (error) {
        console.error("Error generating suggestions:", error);
        return new Response(JSON.stringify({ error: ERROR_MESSAGES.SUGGESTIONS_NOT_GENERATED }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}