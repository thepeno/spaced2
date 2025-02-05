import BouncyButton from '@/components/bouncy-button';
import { useOnlineStatus } from '@/components/hooks/online-status';
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
import { logout } from '@/lib/auth';
import SyncEngine from '@/lib/sync/engine';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const online = useOnlineStatus();
  const handleLogout = async () => {
    const logoutResponse = await logout();

    if (!logoutResponse.success) {
      console.error('Failed to logout', logoutResponse.message);
      throw new Error(logoutResponse.message);
    }

    await SyncEngine.wipeDatabase();
    location.reload();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button>
          <BouncyButton
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
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your local data will be cleared for privacy. You can always sync
            your data again by signing back in with your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.promise(handleLogout, {
                loading: 'Signing out...',
                success: 'Signed out successfully',
                error: 'Failed to sign out',
              });
            }}
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
