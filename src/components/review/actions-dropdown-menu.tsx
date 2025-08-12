// Dropdown menu for actions on a review card
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dropdownMenuItemVariants } from '@/components/ui/dropdown-variants';
import { cn } from '@/lib/utils';
import {
  Prohibit,
  BookmarkSimple,
  CaretDoubleRight,
  DotsThree,
  PencilSimple,
  Trash,
} from 'phosphor-react';

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
            <DotsThree className='size-6' />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn(
            'w-56 sm:w-40 text-muted-foreground text-base sm:text-sm bg-muted/80 backdrop-blur-xl rounded-lg p-1 flex flex-col shadow-sm mt-0 mr-6 animate-fade-in-dropdown-menu z-20 gap-1',
            'sm:-mt-2'
          )}
          align='end'
          alignOffset={-10}
        >
          <DropdownMenuItem
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
          </DropdownMenuItem>

          <DropdownMenuSeparator className='bg-muted-foreground/10 mx-0 my-0' />

          <DropdownMenuGroup className='flex flex-col gap-0'>
            <DropdownMenuItem
              className={dropdownMenuItemVariants({ variant: 'telegram' })}
              onClick={handleSkip}
            >
              <CaretDoubleRight className='size-5 group-hover:animate-scale-arrow-icon-size' />
              <p className='text-base sm:text-sm'>Skip</p>
            </DropdownMenuItem>

            <DropdownMenuItem
              className={dropdownMenuItemVariants({ variant: 'telegram' })}
              onClick={handleBury}
            >
              <Prohibit className='size-5 group-hover:animate-scale-icon-size' />
              <p className='text-base sm:text-sm'>Bury</p>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className='bg-muted-foreground/10 mx-0 my-0' />

          <DropdownMenuGroup className='flex flex-col gap-0'>
            <DropdownMenuItem
              className={dropdownMenuItemVariants({ variant: 'telegram' })}
              onClick={handleEdit}
            >
              <PencilSimple className='size-5 group-hover:animate-move-pencil-icon' />
              <p className='text-base sm:text-sm'>Edit</p>
            </DropdownMenuItem>

            <DropdownMenuItem
              className={dropdownMenuItemVariants({ variant: 'telegram' })}
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
