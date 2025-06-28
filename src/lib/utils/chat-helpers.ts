"use client";

import { Message } from "ai";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { TOOL_NAMES } from "../constants/toolNames";

type ErrorHandlerProps = {
    error: Error;
    setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
}

export const chatErrorHandler = ({ error, setMessages}: ErrorHandlerProps) => {
      switch(error.message) {
        case ERROR_MESSAGES.CHAT_NOT_FOUND:
          toast.error(ERROR_MESSAGES.CHAT_NOT_FOUND);
          break;
        case ERROR_MESSAGES.CHAT_CREATION_FAILED:
          toast.error(ERROR_MESSAGES.CHAT_CREATION_FAILED);
          break;
        case ERROR_MESSAGES.CHAT_UPDATE_FAILED:
          toast.error(ERROR_MESSAGES.CHAT_UPDATE_FAILED);
          break;
        case ERROR_MESSAGES.CHAT_ID_REQUIRED:
          toast.error( ERROR_MESSAGES.CHAT_ID_REQUIRED);
          break;

        case ERROR_MESSAGES.CHARACTER_NOT_FOUND:
          toast.error(ERROR_MESSAGES.CHARACTER_NOT_FOUND);
          break;

        case ERROR_MESSAGES.LLM_MODEL_NOT_FOUND:
        case ERROR_MESSAGES.LLM_MODEL_REQUIRED:
        case ERROR_MESSAGES.LLM_MODEL_ACCESS_DENIED:
          toast.error(ERROR_MESSAGES.LLM_GENERIC_ERROR);

          // We're going to add a tool message to the chat where they can choose a model
          setMessages((prev) => {
            const newMsg: Message = {
              id: uuidv4(),
              role: "assistant",
              content: "",
              createdAt: new Date(),
              parts: [
                {
                  type: "tool-invocation",
                  toolInvocation: {
                    toolName: TOOL_NAMES.chooseModel,
                    toolCallId: uuidv4(),
                    args: {},
                    result: "",
                    state: "result"
                  }
                }
              ]
            }
            return [...prev, newMsg];
          })

          break;

        case ERROR_MESSAGES.UNAUTHORIZED:
          // toast.error(ERROR_MESSAGES.UNAUTHORIZED);

          // We're going to add a tool message to the chat where they can log in
          
          // add an assistant message to the chat
          setMessages((prevMessages) => {
            const newMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: "",
              createdAt: new Date(),
              parts: [
                {
                  type: "tool-invocation",
                  toolInvocation: {
                    toolName: TOOL_NAMES.login,
                    toolCallId: uuidv4(),
                    args: {},
                    result: "",
                    state: "result"
                  }
                }
              ]
            };
            return [...prevMessages, newMessage];
          });

          break;

        default:
          toast.error(ERROR_MESSAGES.GENERIC_ERROR);
      }
}