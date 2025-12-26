import React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  MessageSquare,
  Phone,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export type TabType = "home" | "friends" | "chat" | "calls" | "settings";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "friends", label: "Friends", icon: Users },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "settings", label: "Settings", icon: Settings },
];

const SidebarContent: React.FC<
  SidebarProps & {
    onLogout: () => void;
    username: string | undefined;
    isCollapsed?: boolean;
    onHomeClick?: () => void;
  }
> = ({
  activeTab,
  onTabChange,
  onLogout,
  username,
  isCollapsed = false,
  onHomeClick,
}) => {
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      onTabChange("home");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border px-4",
          isCollapsed ? "h-16 justify-center" : "h-16"
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <>
            <div className="flex-1">
              <span className="text-lg font-semibold text-foreground">
                CodifyLive
              </span>
              {username && (
                <p className="text-xs text-muted-foreground">
                  Welcome back, {username}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isHome = item.id === "home";

          return (
            <button
              key={item.id}
              onClick={isHome ? handleHomeClick : () => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive && "text-primary"
                )}
              />
              {!isCollapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-3">
            <UserAvatar username={username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {username || "User"}
              </p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UserAvatar username={username} size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    setOpen(false);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 h-10 w-10 bg-card shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SidebarContent
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            username={user?.profile?.username}
            onHomeClick={handleHomeClick}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden flex-shrink-0 border-r border-sidebar-border bg-sidebar md:block relative transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={handleLogout}
        username={user?.profile?.username}
        isCollapsed={isCollapsed}
        onHomeClick={handleHomeClick}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-md hover:bg-sidebar-accent z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
};

export default Sidebar;
