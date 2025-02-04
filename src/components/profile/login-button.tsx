import { GoogleSignIn } from '@/components/auth/google-sign-in';
import BouncyButton from '@/components/bouncy-button';
import { LoginForm } from '@/components/form/login-form';
import { RegisterForm } from '@/components/form/register-form';
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
import { login, register, registerAndSync } from '@/lib/auth';
import { LoginFormValues, RegisterFormValues } from '@/lib/form-schema';
import { cn } from '@/lib/utils';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type LoginFormDialogContentProps = {
  onSuccess: () => void;
};

export function LoginFormDialogContent({
  onSuccess,
}: LoginFormDialogContentProps) {
  const [formType, setFormType] = useState<'login' | 'register'>('login');

  const handleLogin = async (data: LoginFormValues) => {
    const response = await login(data.email, data.password);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    emitChange();
    onSuccess();
  };

  const handleRegister = async (data: RegisterFormValues) => {
    const response = await register(data.email, data.password);

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
        {formType === 'login' ? (
          <LoginForm onSubmit={handleLogin} />
        ) : (
          <RegisterForm onSubmit={handleRegister} />
        )}

        <div className='flex justify-center mb-4'>
          <GoogleSignIn />
        </div>

        {formType === 'login' && (
          <div className='text-sm text-center text-gray-500'>
            Don't have an account?{' '}
            <a
              href='#'
              className='text-blue-600 hover:underline'
              onClick={() => setFormType('register')}
            >
              Sign up
            </a>
          </div>
        )}

        {formType === 'register' && (
          <div className='text-sm text-center text-gray-500'>
            Already have an account?{' '}
            <a
              href='#'
              className='text-blue-600 hover:underline'
              onClick={() => setFormType('login')}
            >
              Sign in
            </a>
          </div>
        )}
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
