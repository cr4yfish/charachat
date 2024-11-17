# Charachat

Highly work in progress character chat app.

Lets you create a character or use a pre-made one and chat with them. The character will respond to you based on their personality and remember things you've said to them. This lets you have a dynamic and personal conversation with a character.

All Messages are stored encrypted in the database and decrypted on the client side - which means no one exepct you (and the AI) can read your messages.

<div style="width: 100%; display: flex; justify-content: center; gap: 1rem;">
    <img src="https://i.imgur.com/9Xze8SQ.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/ePtkQTI.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/Kb57kgu.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/7lJHLG9.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/8FpYG8J.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/WnmFLCD.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/G8fG5wr.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/WT3uYZt.png" style="height: 500px; width: auto;" >
    
</div>

## Features

### Characters
- [x] Basic bio
- [ ] Personality, traits, quirks
- [x] Long Background story
- [x] Share Characters with other

### AI Features
- [x] Agent Structure
- [x] Memory Agent
- [x] LLMs
    - [x] OpenAI
    - [x] Mistral
    - [x] Ollama
    - [x] Gemini
    - [x] Claude

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
- [x] Emojis
- [ ] Images
    - [ ] From AI
    - [ ] From User
- [ ] Gifs
- [ ] Editing & deleting messages
- [x] Message Encryption

## Tech Stack
- Shadcn UI
- NextUI
- Tailwind CSS
- Next.js
- TypeScript
- Supabase
- Vercel AI SDK
