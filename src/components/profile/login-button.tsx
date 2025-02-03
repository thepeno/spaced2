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
import { login, registerAndSync } from '@/lib/auth';
import { LoginFormValues } from '@/lib/form-schema';
import { cn } from '@/lib/utils';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type LoginFormDialogContentProps = {
  onSuccess: () => void;
};

function LoginFormDialogContent({ onSuccess }: LoginFormDialogContentProps) {
  const handleSubmit = async (data: LoginFormValues) => {
    const response = await login(data.email, data.password);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    emitChange();
    onSuccess();
  };

  return (
    <div className=''>
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
    </div>
  );
}

export function LoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const online = useOnlineStatus();

  const onLoginSuccess = async () => {
    toast.success('Logged in!');
    setIsOpen(true);

    toast.promise(registerAndSync(), {
      loading: 'Syncing...',
      success: 'Synced!',
      error: 'Error syncing',
    });
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
      <DialogContent className='w-full h-max transition-all'>
        <LoginFormDialogContent onSuccess={onLoginSuccess} />
      </DialogContent>
    </Dialog>
  );
}
