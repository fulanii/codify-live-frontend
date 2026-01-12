import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Trash2, User, Calendar, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsTab: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });
      // Force full page refresh to ensure all state is cleared
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while attempting to delete your account.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
      <section className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5 text-primary" />
          Profile
        </h2>

        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <UserAvatar username={user?.profile?.username} size="lg" />
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Username</label>
              <p className="text-lg font-semibold">{user?.profile?.username || 'Unknown'}</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.auth?.email || 'No email'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {user?.profile?.created_at 
                  ? format(new Date(user.profile.created_at), 'MMMM d, yyyy')
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Statistics</h2>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <StatItem label="Friends" value={user?.friends?.length || 0} />
          <StatItem label="Incoming Requests" value={user?.incoming_requests?.length || 0} />
          <StatItem label="Outgoing Requests" value={user?.outgoing_requests?.length || 0} />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers, including your messages,
                  friends, and profile information.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Yes, delete my account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: number;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <div className="rounded-lg bg-muted/30 p-4 text-center">
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default SettingsTab;
