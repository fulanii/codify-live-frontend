import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+={}[\]|\\;:'",.<>?/~`]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isUsernameValid = /^[a-zA-Z0-9_.]{3,8}$/.test(username);
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !username.trim() || !password.trim()) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!isUsernameValid) {
      toast({
        title: 'Invalid username',
        description: 'Username must be 3-8 characters with only letters, numbers, underscores, or dots',
        variant: 'destructive',
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: 'Invalid password',
        description: 'Password does not meet the requirements',
        variant: 'destructive',
      });
      return;
    }

    if (!doPasswordsMatch) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await register({ email: email.trim(), username: username.trim(), password });
      toast({
        title: 'Account created!',
        description: 'You can now sign in with your credentials.',
      });
      navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-muted-foreground">Join CodifyLive today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username (3-8 chars)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
              className={cn(
                username.length > 0 && (isUsernameValid ? 'border-success' : 'border-destructive')
              )}
            />
            {username.length > 0 && !isUsernameValid && (
              <p className="text-xs text-destructive">
                3-8 characters, letters, numbers, underscores, or dots only
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password requirements */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
                <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
                <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
                <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
                <PasswordCheck passed={passwordChecks.number} label="One number" />
                <PasswordCheck passed={passwordChecks.special} label="One special character" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
              className={cn(
                confirmPassword.length > 0 && (doPasswordsMatch ? 'border-success' : 'border-destructive')
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !isPasswordValid || !isUsernameValid || !doPasswordsMatch}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

interface PasswordCheckProps {
  passed: boolean;
  label: string;
}

const PasswordCheck: React.FC<PasswordCheckProps> = ({ passed, label }) => (
  <div className="flex items-center gap-2">
    {passed ? (
      <Check className="h-3 w-3 text-success" />
    ) : (
      <X className="h-3 w-3 text-muted-foreground" />
    )}
    <span className={passed ? 'text-success' : 'text-muted-foreground'}>{label}</span>
  </div>
);

export default RegisterPage;
