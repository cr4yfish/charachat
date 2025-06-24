# Charachat

<div align="center">

[![Website](https://img.shields.io/badge/🌐_Website-charachat.app-blue?style=for-the-badge)](https://charachat.app)
[![Reddit](https://img.shields.io/badge/💬_Reddit-r/charachat-orange?style=for-the-badge)](https://www.reddit.com/r/Charachat)
[![Discord](https://img.shields.io/badge/💭_Discord-Join_Chat-purple?style=for-the-badge)](https://discord.gg/2HqqwcwGCy)

</div>

## Charachat - Private AI Character Chat Platform

**Chat with AI characters using your choice of 10+ providers, with strong encryption and complete privacy.**

Create or use pre-made characters and have dynamic, personal conversations. Characters respond based on their personality and remember your interactions, creating truly engaging AI relationships.

🔒 **Privacy-First**: All messages encrypted with AES-256-GCM  
⭐ **Open Source**: Full transparency, no vendor lock-in  
🚀 **Multi-Provider**: Choose from OpenAI, Claude, Gemini, Ollama, and more  
🛡️ **No Data Selling**: Your conversations stay private

All messages are encrypted in the database using AES-256-GCM encryption with cryptographically secure keys, ensuring your conversations remain private and secure.

<div style="width: 100%; display: flex; justify-content: center; gap: 1rem;">
    <img src="https://i.imgur.com/IGnXd8c.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/7C9pvs8.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/iihuIdu.png" style="height: 500px; width: auto;" >
    <img src="https://i.imgur.com/BvIPVry.png" style="height: 500px; width: auto;" >
</div>

## ✨ Features

### 🎭 Character Creation & Management
- **Rich Character Profiles**: Create detailed characters with personality, backstory, and unique traits
- **Import from Popular Sources**: Anime/Manga, Wikipedia, Fandoms, SillyTavern formats
- **Private & Encrypted**: Your characters are encrypted and only accessible to you
- **Community Sharing**: Share your creations with others (optional)

### 🤖 AI-Powered Conversations  
- **Multiple AI Providers**: Choose from OpenAI, Claude, Gemini, Mistral, Ollama, and more
- **Advanced Memory**: Characters remember your conversations and build relationships
- **Dynamic Responses**: Personalities adapt and evolve based on interactions
- **Agent Architecture**: Sophisticated AI system for realistic character behavior

### 💬 Advanced Chat Experience
- **Real-time Messaging**: Smooth, responsive chat interface
- **Message Editing**: Edit or delete messages anytime
- **Rich Content**: Emojis, AI-generated images, and more
- **Story Integration**: Create and chat within custom story scenarios

### 🔒 Privacy & Security
- **AES-256-GCM Encryption**: Military-grade encryption for all messages
- **No Data Selling**: Your conversations are never sold or analyzed
- **Open Source**: Fully transparent, auditable code

### ⚙️ Customization & Control
- **Your API Keys**: Use your own AI provider accounts
- **Content Freedom**: No arbitrary censorship or content restrictions  
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Export (coming soon)/Import**: Full control over your data

## Quick Start
1. Open the webapp
2. Create a new account
3. Go to your profile settings and add one or more API keys
4. When creating a new Chat, make sure to only use LLMs for which you have an API key

## Privacy & Security

**Encryption**: All messages and private characters are encrypted in the database using AES-256-GCM encryption with cryptographically secure keys generated using `crypto.randomBytes()`. This ensures your data is protected at rest.

**Data Privacy**: Your conversations are private and secure. We don't sell your data or use it for advertising. Messages are transmitted over HTTPS for additional security in transit.

**Key Management**: Encryption keys are securely generated server-side and stored in your user metadata. Keys are not derived from passwords, ensuring cryptographic security.

**Open Source**: Full transparency through open-source code, allowing you to verify our security implementations.

**Security Transparency**: I welcome security researchers and developers to review the codebase and address any security concerns. Public pentesting of the source code is encouraged - if you find security issues, please reach out so we can address them promptly.

This is what an encrypted message looks like in the database:
```
ENC:9651211f2b583c960f98ba666f7b9633:16aa7377b3cc15d0720c3129097c1dfca935619fb7f4b933bb4e1d356b1a07da6d5034a2221a5f48cc301bddb749d47e52f2f0ce3830ce1ac2898f4f34a390118e153601233b5ce54b642167457a22955df4825823147a8efb59cc6da59f80dc253453fe0d9f00338c59ce3b7a3fab3ab98bc08836a464b409187e38268da2009a6235a6f5546b1ed5ab194bda914143fbcf37136419168574da510bf2d18885b493bf0b0329b8c0da97dda548d06df4047f2a34200ca93e663600de7ae4280cb4c3166ef3de0ab5858304ac44af64108b3ea77d2602e87a1ca0b4a603c2198063c832e0e40f830cd38604b5b78f14eb8f25d670fd30c7a6e63c7bd32ec724549dc851fb43843cdb242f3ea863fa5f7d91b5f121d4f04b353cae3f732ce06598267e0ce53c1c0042601218a8b6f313611a7f34972c6ece51d9064dee6a29d77c89b0f04fbb7d641f10d8385529f054cb27a9221d97f0eca0674895e545b529dfe1f0a259a1b44f22e660e8a3da9f367c4d9f610ab1213a3b79f63b3a37359b75cfdcef162c5f89c60496856119123b62e4937ab31061770579478ac03641724e4a74466254c13268d98d211a98d13c04
```

As you can see, messages are stored in an encrypted format that cannot be read without the proper decryption key.

## How Charachat Compares

| Feature | Charachat | Character.AI | JanitorAI |
|---------|-----------|--------------|-----------|
| **Encryption** | ✅ AES-256-GCM | ❌ None | ❌ None |
| **Open Source** | ✅ Free & Open | ❌ Closed | ❌ Closed |
| **AI Choice** | ✅ 10+ Providers | ❌ Locked In | ❌ Limited |
| **Private Characters** | ✅ Encrypted | ❌ Public | ❌ Public |
| **Content Policy** | ✅ User Choice | ❌ Censored | ⚠️ NSFW Only |
| **Data Selling** | ✅ Never | ❌ Unknown | ❌ Unknown |
| **Development** | ✅ Solo Dev | 🏢 Corp Team | 🏢 Corp Team |
| **Transparency** | ✅ Full Code Access | ❌ Black Box | ❌ Black Box |

*Choose the platform that respects your privacy and gives you control.*

## Tech Stack
- Shadcn UI
- NextUI
- Tailwind CSS
- Next.js
- TypeScript
- Supabase
- Vercel AI SDK

## Roadmap

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