// Dropdown menu for actions on a review card
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Ban,
  BookmarkIcon,
  ChevronsRight,
  Ellipsis,
  Pencil,
  Trash
} from 'lucide-react';

type ActionsDropdownMenuProps = {
  bookmarked: boolean;
  handleBookmark: (bookmarked: boolean) => void;
  handleDelete: () => void;
  handleSkip: () => void;
  handleBury: () => void;
  handleEdit: () => void;
};

export default function ActionsDropdownMenu({
  bookmarked,
  handleBookmark,
  handleDelete,
  handleSkip,
  handleEdit,
  handleBury,
}: ActionsDropdownMenuProps) {
  return (
    <>
      {/* Without this, when we close the "handle delete" alert dialog, pointer events is still set to none. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className='px-2 py-3 cursor-pointer text-muted-foreground/50 active:text-muted-foreground transition-all'>
            <Ellipsis className='size-6' />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-56 sm:w-40 text-muted-foreground text-base sm:text-sm bg-muted rounded-lg p-1 flex flex-col shadow-md mt-3 mr-8 animate-fade-in-dropdown-menu z-20 gap-1'>
          <DropdownMenuItem
            className='flex items-center gap-5 sm:gap-2 font-medium group'
            onClick={() => handleBookmark(!bookmarked)}
          >
            <BookmarkIcon
              className={cn(
                'size-5 group-hover:animate-wobble-icon',
                bookmarked && 'text-primary'
              )}
              fill={bookmarked ? 'currentColor' : 'none'}
            />
            <p className='text-base sm:text-sm'>
              {bookmarked ? 'Unsave' : 'Save'}
            </p>
          </DropdownMenuItem>

          <DropdownMenuSeparator className='bg-muted-foreground/10 mx-0 my-0' />

          <DropdownMenuGroup className='flex flex-col gap-0'>
            <DropdownMenuItem
              className='flex gap-5 sm:gap-2 items-center font-medium group'
              onClick={handleSkip}
            >
              <ChevronsRight className='size-5 group-hover:animate-scale-arrow-icon-size' />
              <p className='text-base sm:text-sm'>Skip</p>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex gap-5 sm:gap-2 items-center font-medium group'
              onClick={handleBury}
            >
              <Ban className='size-5 group-hover:animate-scale-icon-size' />
              <p className='text-base sm:text-sm'>Bury</p>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className='bg-muted-foreground/10 mx-0 my-0' />

          <DropdownMenuGroup className='flex flex-col gap-0'>
            <DropdownMenuItem
              className='flex gap-5 sm:gap-2 items-center font-medium group'
              onClick={handleEdit}
            >
              <Pencil className='size-5 group-hover:animate-move-pencil-icon' />
              <p className='text-base sm:text-sm'>Edit</p>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex gap-5 sm:gap-2 items-center font-medium group'
              onClick={handleDelete}
            >
              <Trash className='size-5 group-hover:animate-bounce-trash-icon' />
              <p className='text-base sm:text-sm'>Delete</p>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
