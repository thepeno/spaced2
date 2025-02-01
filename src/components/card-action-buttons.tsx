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
import { buttonVariants } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Bookmark, ChevronsRight, TrashIcon, Undo } from 'lucide-react';

type CardActionButtonsProps = {
  onUndo?: () => void;
  onSkip?: () => void;
  onDelete?: () => void;
  onBookmark?: (bookmarked: boolean) => void;
  bookmarked?: boolean;
};

export default function CardActionButtons({
  onUndo,
  onSkip,
  onDelete,
  onBookmark,
  bookmarked = false,
}: CardActionButtonsProps) {
  return (
    <div className='flex gap-2'>
      {/* Bookmark Button */}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger
            onClick={() => onBookmark?.(!bookmarked)}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'group'
            )}
          >
            <Bookmark
              className={cn(
                'h-6 w-6 transition-all duration-300 ease-out group-active:scale-110'
              )}
              strokeWidth={1.5}
              fill={bookmarked ? 'cornflowerblue' : 'none'}
              stroke={bookmarked ? 'cornflowerblue' : 'black'}
            />
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>

      {/* Undo Button */}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger
            onClick={onUndo}
            className={cn(
              buttonVariants({
                variant: 'ghost',
                size: 'icon',
              })
            )}
          >
            <Undo className='h-6 w-6' strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent className='flex flex-col items-center'>
            <p>Undo</p>
            <Kbd>Ctrl+Z</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Suspend Button */}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger
            onClick={onSkip}
            className={cn(
              buttonVariants({
                variant: 'ghost',
                size: 'icon',
              })
            )}
          >
            <ChevronsRight className='h-6 w-6' strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent className='flex flex-col items-center'>
            <p>Suspend</p>
            <Kbd className='mx-auto'>Shift+→</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Delete Button */}
      <AlertDialog>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' })
                )}
              >
                <TrashIcon className='h-4 w-4' strokeWidth={1.5} />
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent className='flex flex-col items-center'>
              <p>Delete card</p>
              <Kbd className='mx-auto'>Shift+D</Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className={cn(buttonVariants({ variant: 'destructive' }))}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
