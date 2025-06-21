/**
 * API Routes for the application
 * 
 */

export const API_ROUTES = {

    // Character related routes
    GET_CHARACTER_BY_ID: "/api/characters?id=",
    GET_CHARACTERS: "/api/characters",
    GET_CHARACTERS_BY_CATEGORY: "/api/characters/category",
    GET_TRENDING_CHARACTERS: "/api/characters/trending",
    GET_NEWEST_CHARACTERS: "/api/characters/newest",
    GET_POPULAR_CHARACTERS: "/api/characters/popular",
    CREATE_CHARACTER: "/api/characters/create",
    UPDATE_CHARACTER: "/api/characters/update",

    GET_CATEGORIES: "/api/categories",

    // Chat related routes
    POST_CHAT: "/api/chat",
    UPDATE_CHAT: "/api/chat/settings",
    GET_SHALLOW_CHAT: "/api/chat/shallow?chatId=",
    GET_CHAT: "/api/chat?id=",
    GET_CHATS: "/api/chats",
    GET_SUGGESTIONS: "/api/chat/suggestions?chat-id=",
    GET_CHAT_MESSAGES: "/api/chat/messages?chatId=",
    ADD_CHAT_MESSAGE: "/api/chat/message/add",

    DELETE_MESSAGE: "/api/chat/message/delete?messageId=",

    LLM_COOKIE: "/api/config/llm",

    GET_PERSONAS: "/api/personas",

    // User related routes
    UPLOAD_IMAGE: "/api/image/upload",
    GET_PROFILE: "/api/profile",
    GET_OWN_PROFILE: "/api/profile/me",
    UPDATE_PROFILE: "/api/profile/update",

    // Stats
    GET_TOTAL_CHARACTER_STATS: "/api/stats/total-character-stats",
    GET_TOTAL_CHAT_STATS: "/api/stats/total-chat-stats",
    
}
