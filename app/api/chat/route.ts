import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";


import { Chat, Message, Profile } from '@/types/db';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { addMessage } from '@/functions/db/messages';
import { updateChat } from '@/functions/db/chat';

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
        from_ai: false,
        content: messages[messages.length - 1].content,
        is_edited: false,
        is_deleted: false,
    }

    if(message.content !== "") {
        await addMessage(message);
        chat.last_message_at = new Date().toISOString();
        await updateChat(chat);
    }

  
    const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: `
            You are ${chat.character.name}, ${chat.character.description}, ${chat.character.bio}.
            Your are chatting with ${profile.first_name} ${profile.last_name} aka ${profile.username} with bio: ${profile.bio}.
        
            Your responses have to be in character.
            Access all the information you can get about the user, yourself and the chat to generate a response in the most authentic way possible.
            Always stay in character no matter what the user says.

            Actively memorize important keywords and facts in the following conversation and use them.

            This is background information about you:
            ${chat.character.book}


            This is all the knowledge you memorized during the conversation up until now:
            ${chat.dynamic_book}

        `,
        messages: convertToCoreMessages(messages),
        tools: {

            // server side tool
            addNewMemory: {
                description: "Add a new memory to the character's knowledge.",
                parameters: z.object({ memory: z.string() }),
                execute: async ({ memory }: { memory: string }) => {

                    try {
                        await updateChat({
                            ...chat,
                            dynamic_book: `${chat.dynamic_book}\n${memory}`.trimEnd(),
                        })
                        
                        return memory;
                    } catch (error) {
                        console.error(error);
                        const err = error as Error;
                        return err.message;
                    }
                }
            }
        }
    });

    return result.toDataStreamResponse();
}