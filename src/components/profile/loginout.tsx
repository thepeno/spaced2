import BouncyButton from '@/components/bouncy-button';
import { LoginForm } from '@/components/form/login-form';
import { emitChange } from '@/components/hooks/logged-in-status';
import { useOnlineStatus } from '@/components/hooks/online-status';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { login, registerClient } from '@/lib/auth';
import { LoginFormValues } from '@/lib/form-schema';
import { cn } from '@/lib/utils';
import { LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';

export function LogoutButton() {
  const online = useOnlineStatus();

  return (
    <BouncyButton
      asButton={true}
      variant='large'
      className={cn(
        'bg-background w-full rounded-xl py-4 px-6  cursor-pointer transition-all duration-100 ease-out',
        !online && 'cursor-not-allowed text-muted-foreground'
      )}
    >
      <div className='flex justify-between'>
        <span>Sign out</span>
        <LogOut className='w-6 h-6 text-muted-foreground' />
      </div>
    </BouncyButton>
  );
}

export function LoginButton() {
  const [isOpen, setIsOpen] = useState(false);

  const online = useOnlineStatus();

  const handleSubmit = async (data: LoginFormValues) => {
    const response = await login(data.email, data.password);

    // TODO: add appropriate toast here
    if (!response.success) {
      throw new Error(response.message);
    }

    const clientIdResponse = await registerClient();
    if (!clientIdResponse.success) {
      throw new Error(clientIdResponse.message);
    }

    emitChange();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button>
          <BouncyButton
            variant='large'
            className={cn(
              'bg-background w-full rounded-xl py-4 px-6',
              !online && 'cursor-not-allowed text-muted-foreground'
            )}
            disabled={!online}
          >
            <div className='flex justify-between'>
              <span>Sign in</span>
              <LogIn className='w-6 h-6 text-muted-foreground' />
            </div>
          </BouncyButton>
        </button>
      </DialogTrigger>
      <DialogContent className='w-full h-max'>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Enter your email and password to sign in.
          </DialogDescription>

          <LoginForm onSubmit={handleSubmit} />

          <div className='text-sm text-center text-gray-500'>
            Don't have an account?{' '}
            <a href='#' className='text-blue-600 hover:underline'>
              Sign up
            </a>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
