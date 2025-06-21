# Charachat

[Reddit r/charachat](https://www.reddit.com/r/Charachat)

[Discord](https://discord.gg/2HqqwcwGCy)

[Website](https://charachat.app)

Lets you create a character or use a pre-made one and chat with them. The character will respond to you based on their personality and remember things you've said to them. This lets you have a dynamic and personal conversation with a character.

All Messages are stored encrypted in the database and decrypted on the client side - which means no one exepct you (and the AI) can read your messages.

<div style="width: 100%; display: flex; justify-content: center; gap: 1rem;">
    <img src="https://i.imgur.com/IGnXd8c.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/7C9pvs8.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/iihuIdu.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/BvIPVry.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/fSuKMQk.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/cn3o3tA.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/QZl4sRz.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/G8fG5wr.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/df4Gefj.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/qtCf0MS.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/3TWwGUL.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/ydWPlJi.png" style="height: 500px; width: auto;" >
</div>

## Features

### Characters
- [x] Basic bio
- [x] Personality
- [x] Long Background story
- [x] Share Characters with other
- [x] Import Characters

### Importers
- [x] Anime & Manga
- [x] Fandoms
- [x] Wikipedia
- [ ] Imdb
- [ ] C.ai
- [x] Silly Tavern

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
    - [x] From AI
    - [ ] From User
- [ ] Gifs
- [x] Editing & deleting messages
- [x] Message Encryption


## Quick Start
1. Open the webapp
2. Create a new account
3. Go to your profile settings and add one or more API keys
4. When creating a new Chat, make sure to only use LLMs for which you have an API key

## Privacy & Security
Private Characters are encrypted and only accessible and readable by the owner of the character. They are stored in the database in an encrypted form and only decrypted on demand by the user.

All messages are (kinda) end-to-end encrypted with your AI Model. The Model streams them in plain text to the browser, but since it's inside of an HTTPS connection, they are encrypted.
Aside from that, they are only visible in plain text while in the browser, decrypted using a key generated with your password.
Since your password is also stored (of course) encrypted in the database, it's basically impossible for your messages to be read by others.

This is what a Message looks like in the Database:
```
ENC:9651211f2b583c960f98ba666f7b9633:16aa7377b3cc15d0720c3129097c1dfca935619fb7f4b933bb4e1d356b1a07da6d5034a2221a5f48cc301bddb749d47e52f2f0ce3830ce1ac2898f4f34a390118e153601233b5ce54b642167457a22955df4825823147a8efb59cc6da59f80dc253453fe0d9f00338c59ce3b7a3fab3ab98bc08836a464b409187e38268da2009a6235a6f5546b1ed5ab194bda914143fbcf37136419168574da510bf2d18885b493bf0b0329b8c0da97dda548d06df4047f2a34200ca93e663600de7ae4280cb4c3166ef3de0ab5858304ac44af64108b3ea77d2602e87a1ca0b4a603c2198063c832e0e40f830cd38604b5b78f14eb8f25d670fd30c7a6e63c7bd32ec724549dc851fb43843cdb242f3ea863fa5f7d91b5f121d4f04b353cae3f732ce06598267e0ce53c1c0042601218a8b6f313611a7f34972c6ece51d9064dee6a29d77c89b0f04fbb7d641f10d8385529f054cb27a9221d97f0eca0674895e545b529dfe1f0a259a1b44f22e660e8a3da9f367c4d9f610ab1213a3b79f63b3a37359b75cfdcef162c5f89c60496856119123b62e4937ab31061770579478ac03641724e4a74466254c13268d98d211a98d13c04
```

As you can see, the message is not readable in the database and can only be decrypted with your password on the client side.

## Tech Stack
- Shadcn UI
- NextUI
- Tailwind CSS
- Next.js
- TypeScript
- Supabase
- Vercel AI SDK
