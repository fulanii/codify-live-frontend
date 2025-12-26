import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Users, Activity } from 'lucide-react';

const HomeTab: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          Welcome back, <span className="text-gradient">{user?.profile?.username || 'User'}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Here's what's happening with your network</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Friends"
          value={user?.friends?.length || 0}
          color="primary"
        />
        <StatCard
          icon={MessageSquare}
          label="Pending Requests"
          value={(user?.incoming_requests?.length || 0) + (user?.outgoing_requests?.length || 0)}
          color="accent"
        />
        <StatCard
          icon={Activity}
          label="Status"
          value="Online"
          color="success"
        />
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Find Friends"
            description="Search and connect with other users"
            icon={Users}
          />
          <QuickActionCard
            title="Start Chatting"
            description="Send messages to your friends"
            icon={MessageSquare}
          />
        </div>
      </div>

      {/* Friends activity placeholder */}
      {user?.friends && user.friends.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Your Friends</h2>
          <div className="grid gap-2">
            {user.friends.slice(0, 5).map((friend) => (
              <div
                key={friend.friend_id}
                className="flex items-center gap-3 rounded-lg bg-card p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
                  {friend.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{friend.username || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    Friends since {new Date(friend.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: 'primary' | 'accent' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className="rounded-xl bg-card p-5 transition-all hover-lift">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
