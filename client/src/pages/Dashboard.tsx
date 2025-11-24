import { Route, Switch, Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Home,
} from "lucide-react";
import { FriendsPage } from "@/components/dashboard/FriendsPage";
import { ChatPage } from "@/components/dashboard/ChatPage";
import { AccountPage } from "@/components/dashboard/AccountPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function AppSidebar() {
  const { logout } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { id: "home", title: "Home", icon: Home, href: "/" },
    { id: "friends", title: "Friends", icon: Users, href: "/dashboard" },
    { id: "chat", title: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
    {
      id: "account",
      title: "Account",
      icon: UserIcon,
      href: "/dashboard/account",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">CodifyLive</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const shouldHighlight =
                  item.id !== "home" &&
                  (location === item.href ||
                    (item.href !== "/dashboard" &&
                      location.startsWith(item.href)));

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={shouldHighlight}>
                      <Link href={item.href} data-testid={`nav-${item.id}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover-elevate active-elevate-2"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Dashboard() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProtectedRoute>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between gap-2 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/dashboard" component={FriendsPage} />
                <Route path="/dashboard/chat" component={ChatPage} />
                <Route path="/dashboard/account" component={AccountPage} />
              </Switch>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
