import BouncyButton from '@/components/bouncy-button';
import { emitChange } from '@/components/hooks/logged-in-status';
import { useOnlineStatus } from '@/components/hooks/online-status';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { login, registerClient } from '@/lib/auth';
import { loginFormSchema, LoginFormValues } from '@/lib/form-schema';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, LogIn, LogOut, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function LogoutButton() {
  const online = useOnlineStatus();

  return (
    <BouncyButton
      asButton={true}
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
  const [isLoading, setIsLoading] = useState(false);

  const online = useOnlineStatus();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const response = await login(data.email, data.password);
    setIsLoading(false);

    if (!response.success) {
      throw new Error(response.message);
    }

    const clientIdResponse = await registerClient();
    if (!clientIdResponse.success) {
      throw new Error(clientIdResponse.message);
    }

    emitChange();
    form.reset();
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
      <DialogContent className='w-80 h-80'>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Enter your email and password to sign in.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='flex flex-col gap-4 py-4'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start'>
                    <FormLabel className='text-primary'>Email</FormLabel>
                    <FormControl>
                      <div className='relative items-center gap-2 w-full'>
                        <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input className='pl-10 text-sm' {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start'>
                    <FormLabel className='text-primary'>Password</FormLabel>
                    <FormControl>
                      <div className='relative items-center gap-2 w-full'>
                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          className='pl-10 text-sm'
                          type='password'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full bg-cyan-500 active:scale-95 transition-all duration-100 ease-out hover:bg-cyan-600 mt-4'
                size={'lg'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>

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
