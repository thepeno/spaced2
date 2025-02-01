import * as React from 'react';
import { Link } from 'react-router';

import { ProfileButton } from '@/components/nav/profile-button';
import { ThemeToggle } from '@/components/nav/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { MenuIcon, Telescope, XIcon } from 'lucide-react';

function MobileMenuDrawer() {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer
      direction='left'
      open={open}
      onOpenChange={(opened) => setOpen(opened)}
    >
      <DrawerTrigger className='md:hidden'>
        <MenuIcon className='h-6 w-6' />
      </DrawerTrigger>
      <DrawerContent className='h-full w-60 py-8' direction='left'>
        <DrawerClose className='absolute right-4 top-6'>
          <XIcon className='h-4 w-4 text-muted-foreground' />
        </DrawerClose>

        <Link to='/' className='flex items-center px-4'>
          <Telescope className='mr-2 h-5 w-5' strokeWidth={1.5} />
          <div className='text-md font-semibold'>spaced</div>
        </Link>

        <div className='mt-6 flex flex-col gap-y-5 pl-11'>
          <div className='flex flex-col gap-y-3'>
            <Link to='/' className='text-md' onClick={() => setOpen(false)}>
              Review
            </Link>
          </div>

          <div className='flex flex-col gap-y-3'>
            <Link
              to='/decks'
              className='text-md'
              onClick={() => setOpen(false)}
            >
              Decks
            </Link>
          </div>

          <div className='flex flex-col gap-y-3 text-muted-foreground'>
            <div className='text-md font-semibold text-primary'>Create</div>
            <Link
              to='/decks/create'
              className='text-md'
              onClick={() => setOpen(false)}
            >
              Deck
            </Link>
            <Link
              to='/cards/create-many'
              className='text-md'
              onClick={() => setOpen(false)}
            >
              Many cards
            </Link>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function NavigationBar() {
  return (
    <NavigationMenu className='col-start-1 col-end-13 h-16 px-1 md:px-4 xl:col-start-3 xl:col-end-11'>
      <MobileMenuDrawer />

      <NavigationMenuList className='hidden md:flex'>
        <NavigationMenuItem>
          <NavigationMenuLink className={'mr-2 flex justify-start'} asChild>
            <Link to='/'>
              <Telescope className='h-6 w-6 xs:mr-2' strokeWidth={1.5} />
              <span className='hidden text-lg font-semibold xs:block'>
                spaced
              </span>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to='/'>Review</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to='/decks'>Decks</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to='/decks/create'>New Deck</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to='/cards/create-many'>Bulk Create</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>

      <div className='ml-auto flex items-center gap-2'>
        <Button size='icon' variant='link' asChild>
          <a href='https://github.com/zsh-eng/spaced' target='_blank'>
            <SiGithub className='h-5 w-5' />
          </a>
        </Button>

        <ThemeToggle />

        <ProfileButton />
        {/* <SignIn /> */}
      </div>
    </NavigationMenu>
  );
}

NavigationBar.displayName = 'NavigationBar';
