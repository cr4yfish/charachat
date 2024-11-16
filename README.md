# Charachat

Highly work in progress character chat app.

Lets you create a character or use a pre-made one and chat with them. The character will respond to you based on their personality and remember things you've said to them. This lets you have a dynamic and personal conversation with a character.

All Messages are stored encrypted in the database and decrypted on the client side - which means no one exepct you (and the AI) can read your messages.

## Features

### Characters
- [x] Basic bio
- [ ] Personality, traits, quirks
- [x] Long Background story
- [x] Share Characters with other

### AI Features
- [x] Agent Structure
- [x] Memory Agent
- [ ] LLM Switching
    - [x] OpenAI gpt4-o
    - [ ] Mistral
        - [ ] Provider
        - [ ] Self Hosted
    - [ ] Ollama Self Hosted
    - [ ] Gemini
    - [ ] Claude

### AI Data Access in Chats
- [x] Character data
- [x] User data
- [x] Static Background information
- [x] Aquiring new information on its own

### Stories
- [x] Create & Edit Stories with Characters
- [x] Create Chats based on Stories

### Chat Features
- [x] Basic text chat
- [ ] Emojis
- [ ] Images
    - [ ] From AI
    - [ ] From User
- [ ] Gifs
- [ ] Editing & deleting messages
- [x] Message Encryption

## Tech Stack
- Next.js
- Tailwind CSS
- TypeScript
- Supabase
- Vercel AI SDK
