import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { dropdownMenuItemVariants } from '@/components/ui/dropdown-variants';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@uidotdev/usehooks';
import { Prohibit, BookmarkSimple, CaretDoubleRight, PencilSimple, Trash } from 'phosphor-react';

type DesktopActionsContextMenuProps = {
  children: React.ReactNode;
  bookmarked: boolean;
  handleBookmark: (bookmarked: boolean) => void;
  handleDelete: () => void;
  handleSkip: () => void;
  handleBury: () => void;
  handleEdit: () => void;
};

export default function DesktopActionsContextMenu({
  bookmarked,
  handleBookmark,
  handleDelete,
  handleSkip,
  handleBury,
  handleEdit,
  children,
}: DesktopActionsContextMenuProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger
        onContextMenu={(e) => {
          if (isMobile) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        asChild
      >
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent className='w-56 sm:w-40 text-muted-foreground text-base sm:text-sm bg-muted/80 backdrop-blur-xl rounded-lg p-1 flex flex-col shadow-sm mt-3 mr-8 animate-fade-in-dropdown-menu z-20 gap-1'>
        <ContextMenuItem
          className={dropdownMenuItemVariants({ variant: 'telegram' })}
          onClick={() => handleBookmark(!bookmarked)}
        >
          <BookmarkSimple
            className={cn(
              'size-5 group-hover:animate-wobble-icon',
              bookmarked && 'text-primary'
            )}
            weight={bookmarked ? 'fill' : 'regular'}
          />
          <p className='text-base sm:text-sm'>
            {bookmarked ? 'Unsave' : 'Save'}
          </p>
        </ContextMenuItem>

        <ContextMenuSeparator className='bg-muted-foreground/10 mx-0 my-0' />

        <ContextMenuGroup className='flex flex-col gap-0'>
          <ContextMenuItem
            className={dropdownMenuItemVariants({ variant: 'telegram' })}
            onClick={handleSkip}
          >
            <CaretDoubleRight className='size-5 group-hover:animate-scale-arrow-icon-size' />
            <p className='text-base sm:text-sm'>Skip</p>
          </ContextMenuItem>

          <ContextMenuItem
            className={dropdownMenuItemVariants({ variant: 'telegram' })}
            onClick={handleBury}
          >
            <Prohibit className='size-5 group-hover:animate-scale-icon-size' />
            <p className='text-base sm:text-sm'>Bury</p>
          </ContextMenuItem>
        </ContextMenuGroup>

        <ContextMenuSeparator className='bg-muted-foreground/10 mx-0 my-0' />

        <ContextMenuGroup className='flex flex-col gap-0'>
          <ContextMenuItem
            className={dropdownMenuItemVariants({ variant: 'telegram' })}
            onClick={handleEdit}
          >
            <PencilSimple className='size-5 group-hover:animate-move-pencil-icon' />
            <p className='text-base sm:text-sm'>Edit</p>
          </ContextMenuItem>

          <ContextMenuItem
            className={dropdownMenuItemVariants({ variant: 'telegram' })}
            onClick={handleDelete}
          >
            <Trash className='size-5 group-hover:animate-bounce-trash-icon' />
            <p className='text-base sm:text-sm'>Delete</p>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
