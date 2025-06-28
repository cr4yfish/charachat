"use client";

import { Message } from "ai";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

/**
 * Hook system for managing message editing state across components.
 * 
 * This hook eliminates the need to pass functions down through multiple component levels.
 * Instead of passing an edit function from Chat → Message → Footer, you can:
 * 
 * 1. Wrap your chat components with MessageEditProvider
 * 2. Use useMessageEdit() in the message footer to trigger editing
 * 3. Use useMessageEditDrawer() in the drawer component to manage its state
 * 
 * Example usage:
 * 
 * ```tsx
 * // In your chat layout or page
 * <MessageEditProvider>
 *   <Chat />
 *   <MessageEditDrawer callback={handleMessageUpdate} />
 * </MessageEditProvider>
 * 
 * // In your message footer component
 * const { openMessageEdit } = useMessageEdit();
 * const handleEdit = () => openMessageEdit(message);
 * 
 * // In your drawer component
 * const { editingMessage, isDrawerOpen, onOpenChange } = useMessageEditDrawer();
 * ```
 */

type MessageEditContextType = {
  // The message currently being edited
  editingMessage: Message | null;
  // Whether the drawer is open
  isDrawerOpen: boolean;
  // Actions to manage the state
  openDrawer: (message: Message) => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

const MessageEditContext = createContext<MessageEditContextType | undefined>(undefined);

export const MessageEditProvider = ({ children }: { children: ReactNode }) => {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback((message: Message) => {
    setEditingMessage(message);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setEditingMessage(null);
    setIsDrawerOpen(false);
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
    // Clear the editing message when closing the drawer
    if (!open) {
      setEditingMessage(null);
    }
  }, []);

  return (
    <MessageEditContext.Provider
      value={{
        editingMessage,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        setDrawerOpen,
      }}
    >
      {children}
    </MessageEditContext.Provider>
  );
};

const useMessageEditContext = () => {
  const context = useContext(MessageEditContext);
  if (context === undefined) {
    throw new Error("useMessageEditContext must be used within a MessageEditProvider");
  }
  return context;
};

// Hook for the message component to trigger editing
export const useMessageEdit = () => {
  const { openDrawer } = useMessageEditContext();
  
  return {
    openMessageEdit: openDrawer,
  };
};

// Hook for the drawer component to manage its state
export const useMessageEditDrawer = () => {
  const { editingMessage, isDrawerOpen, setDrawerOpen, closeDrawer } = useMessageEditContext();

  return {
    editingMessage,
    isDrawerOpen,
    onOpenChange: setDrawerOpen,
    closeDrawer,
  };
};
