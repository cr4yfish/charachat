import { v4 as uuidv4 } from 'uuid';
import { Chat, Message, Profile } from '@/types/db';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { addMessage } from '@/functions/db/messages';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, profile: initProfile, chat: initChat } = await req.json();

    const profile: Profile = initProfile as Profile;
    const chat: Chat = initChat as Chat;

    const message: Message = {
        id: uuidv4(),
        chat: chat,
        character: chat.character,
        user: profile,
        from_ai: true,
        content: messages[messages.length - 1].content,
        is_edited: false,
        is_deleted: false,
    }

    const res = await addMessage(message);
    console.log(res);

    const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: `
            You are ${chat.character.name}, ${chat.character.description}, ${chat.character.bio}.
            Your are chatting with ${profile.first_name} ${profile.last_name} aka ${profile.username} with bio: ${profile.bio}.
        
            Your responses have to be in character.
            Access all the information you can get about the user, yourself and the chat to generate a response in the most authentic way possible.
            Always stay in character no matter what the user says.

            Actively memorize important keywords and facts in the following conversation and use them.

            This is all the knowledge you have until now:
            ${chat.character.book}
        `,
        messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
}