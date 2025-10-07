import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tv } from 'lucide-react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { cn } from '@/lib/utils';

export default function OfflineUsageDialog() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  return (
    <div className='flex flex-col items-center gap-2 my-4'>
      <Tv className='w-8 h-8 text-muted-foreground' />
      <div className='text-center text-muted-foreground text-sm'>
        <p>You're currently offline.</p>
        <Dialog>
          <DialogTrigger className='text-blue-500 text-sm cursor-pointer'>
            What can I do?
          </DialogTrigger>
          <DialogContent className={cn(
            isMobile && 'fixed bottom-0 left-0 right-0 top-auto max-w-none w-full rounded-t-xl rounded-b-none border-0 p-6 m-0 translate-x-0 translate-y-0'
          )}>
            <DialogHeader>
              <DialogTitle>Offline Mode</DialogTitle>
              <DialogDescription>
                spaced is designed to work both online and offline.
                <br />
                While offline, you can still review your cards, update them and
                manage your decks. Your progress is saved locally on your
                device. Any changes you make will sync when you're back online.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
