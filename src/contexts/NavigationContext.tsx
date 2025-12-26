import React, { createContext, useContext, useState, useCallback } from "react";

type TabType = "home" | "friends" | "chat" | "calls" | "settings";

interface NavigationContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingConversationId: string | null;
  setPendingConversationId: (id: string | null) => void;
  navigateToConversation: (conversationId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

export const NavigationProvider: React.FC<{
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}> = ({ children, activeTab, onTabChange }) => {
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);

  const navigateToConversation = useCallback(
    (conversationId: string) => {
      setPendingConversationId(conversationId);
      onTabChange("chat");
    },
    [onTabChange]
  );

  const value: NavigationContextType = {
    activeTab,
    setActiveTab: onTabChange,
    pendingConversationId,
    setPendingConversationId,
    navigateToConversation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
