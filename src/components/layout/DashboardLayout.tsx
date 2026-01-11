import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Sidebar, { TabType } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import HomeTab from "@/components/tabs/HomeTab";
import LandingPage from "@/pages/LandingPage";
import FriendsTab from "@/components/tabs/FriendsTab";
import ChatTab from "@/components/tabs/ChatTab";
import CallsTab from "@/components/tabs/CallsTab";
import SettingsTab from "@/components/tabs/SettingsTab";

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("friends");

  // Handle home tab navigation to landing page
  const handleTabChange = (tab: TabType) => {
    if (tab === "home") {
      navigate("/");
    } else {
      setActiveTab(tab);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      // case "home":
      //   return <LandingPage />;
      case "friends":
        return <FriendsTab />;
      case "chat":
        return <ChatTab />;
      case "calls":
        return <CallsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <FriendsTab />;
    }
  };

  return (
    <NavigationProvider activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-hidden md:pt-0">
          <div className="h-full pt-20 md:pt-0">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
          </div>
        </main>
      </div>
    </NavigationProvider>
  );
};

export default DashboardLayout;
