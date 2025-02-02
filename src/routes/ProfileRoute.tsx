import { SiGithub } from '@icons-pack/react-simple-icons';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router';

export default function ProfileRoute() {
  return (
    <div className='flex flex-col h-full min-h-[90vh] col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-24 pb-6 gap-2'>
      <h1 className='mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
        Profile
      </h1>

      <div className='bg-background w-full rounded-xl py-4 px-6  cursor-pointer active:scale-95 transition-all duration-100 ease-out'>
        <div className='flex justify-between'>
          <span>Logout</span>
          <LogOut className='w-6 h-6 text-muted-foreground' />
        </div>
      </div>

      <Link
        to='https://github.com/zsh-eng'
        className='mx-auto mt-auto'
        target='_blank'
      >
        <div className='group flex text-muted-foreground gap-2'>
          <SiGithub className='group-hover:text-primary transition-all ease-out' />
          <span>made by zsh-eng</span>
        </div>
      </Link>
    </div>
  );
}
