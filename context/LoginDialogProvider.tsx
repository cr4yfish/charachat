"use client";

// context/login-dialog-provider.tsx
import React, { createContext, useContext, useState } from 'react';

interface LoginDialogContextType {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(undefined);

export const useLoginDialog = () => {
  const context = useContext(LoginDialogContext);
  if (!context) {
    throw new Error('useLoginDialog must be used within a LoginDialogProvider');
  }
  return context;
};

export const LoginDialogProvider: React.FC<{ children: React.ReactNode | React.ReactNode[] }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <LoginDialogContext.Provider value={{ isOpen, openDialog, closeDialog, setIsOpen, isLoggedIn, setIsLoggedIn }}>
      {children}
    </LoginDialogContext.Provider>
  );
};