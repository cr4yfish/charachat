/**
 * Error messages used across the application.
 * This file contains a collection of error messages that can be used
 */

export const ERROR_MESSAGES = {
    GENERIC_ERROR: "An unexpected error occurred. Please try again later.",
    NOT_FOUND: "The requested resource was not found.",
    UNAUTHORIZED: "You are not authorized to perform this action.",

    // Chat related errors
    CHAT_NOT_FOUND: "Chat not found. Please check the chat ID and try again.",
    CHAT_CREATION_FAILED: "Failed to create a new chat. Please try again later.",
    CHAT_UPDATE_FAILED: "Failed to update the chat. Please try again later.",
    CHAT_ID_REQUIRED: "Chat ID is required to proceed.",
    SUGGESTIONS_NOT_GENERATED: "Suggestions could not be generated. Please try again later.",

    CHARACTER_NOT_FOUND: "Character not found. Please check the character ID and try again.",
    CHARACTER_CREATION_FAILED: "Failed to create a new character. Please try again later.",
    CHARACTER_UPDATE_FAILED: "Failed to update the character. Please try again later.",
    CHARACTER_ID_REQUIRED: "Character ID is required to proceed.",

    LLM_MODEL_REQUIRED: "LLM model is required to proceed.",
    LLM_MODEL_NOT_FOUND: "LLM model not found. Please check the selected model and try again.",
    LLM_MODEL_ACCESS_DENIED: "You do not have access to this LLM model. Please check your API key and permissions.",

    USER_MESSAGE_NOT_FOUND: "No user message found in the chat. Please ensure you have sent a message before proceeding.",

    PROFILE_NOT_FOUND: "Profile not found. Please check your profile settings and try again.",
}