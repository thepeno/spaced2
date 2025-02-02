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
import { Bookmark, ChevronsRight, TrashIcon } from 'lucide-react';

type CardActionButtonsProps = {
  onUndo?: () => void;
  onSkip?: () => void;
  onDelete?: () => void;
  onBookmark?: (bookmarked: boolean) => void;
  bookmarked?: boolean;
};

export default function CardActionButtons({
  // onUndo,
  onSkip,
  onDelete,
  onBookmark,
  bookmarked = false,
}: CardActionButtonsProps) {
  return (
    <div
      className={cn(
        'absolute left-auto right-auto top-3 flex gap-4 bg-muted rounded-3xl px-4 py-1 text-muted-foreground z-10',
        'sm:left-auto sm:right-2 sm:flex-row-reverse sm:gap-2 sm:px-2 sm:py-0'
      )}
    >
      {/* Delete Button */}
      <AlertDialog>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'group'
                )}
              >
                <TrashIcon
                  className='!h-5 !w-5 sm:!h-4 sm:!w-4 transition-all duration-300 ease-out group-active:scale-110'
                  strokeWidth={2}
                />
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent className='flex flex-col items-center'>
              <p>Delete card</p>
              <Kbd className='mx-auto'>Shift+D</Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Undo Button */}
        {/* <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger
            onClick={onUndo}
            className={cn(
              buttonVariants({
                variant: 'ghost',
                size: 'icon',
              }),
              'group'
            )}
          >
            <Undo
              className='!h-5 !w-5 sm:!h-4 sm:!w-4 transition-all duration-300 ease-out group-active:scale-110'
              strokeWidth={1.8}
            />
          </TooltipTrigger>
          <TooltipContent className='flex flex-col items-center'>
            <p>Undo</p>
            <Kbd>Ctrl+Z</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
 */}
        {/* Suspend Button */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger
              onClick={onSkip}
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  size: 'icon',
                }),
                'group'
              )}
            >
              <ChevronsRight
                className='!h-5 !w-5 sm:!h-4 sm:!w-4 transition-all duration-300 ease-out group-active:scale-110'
                strokeWidth={2}
              />
            </TooltipTrigger>
            <TooltipContent className='flex flex-col items-center'>
              <p>Suspend</p>
              <Kbd className='mx-auto'>Shift+→</Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Bookmark button */}
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
                  '!h-5 !w-5 sm:!h-4 sm:!w-4 transition-all duration-300 ease-out group-active:scale-110'
                )}
                strokeWidth={2}
                fill={bookmarked ? 'cornflowerblue' : 'none'}
                stroke={bookmarked ? 'cornflowerblue' : 'currentColor'}
              />
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-14',
                'rounded-xl'
              )}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'h-14',
                'rounded-xl'
              )}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
