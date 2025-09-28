import { useLoggedInStatus } from '@/components/hooks/logged-in-status';
import { useOnlineStatus } from '@/components/hooks/online-status';
import { useUserInfo } from '@/components/hooks/user-info';
// import { ImagesLinkButton } from '@/components/profile/images-link-button';
import { LoginButton } from '@/components/profile/login-button';
import { LogoutButton } from '@/components/profile/logout-button';
import OfflineUsageDialog from '@/components/profile/offline-usage-dialog';
import { StatsLinkButton } from '@/components/profile/stats-link-button';
import { SettingsLinkButton } from '@/components/profile/settings-link-button';
// import { SiGithub } from '@icons-pack/react-simple-icons';
// import { Link } from 'react-router';

export default function ProfileRoute() {
  const online = useOnlineStatus();
  const loggedIn = useLoggedInStatus();
  const userInfo = useUserInfo();

  console.log(userInfo)

  return (
    <div className='flex flex-col h-full justify-center col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-24 pb-10 gap-8 px-5 pt-6'>

      {/* User Information Section */}
      {loggedIn.isLoggedIn && userInfo.userInfo && (
        <div className="flex flex-col items-center gap-4">
          {userInfo.userInfo.imageUrl && (
            <img
              src={userInfo.userInfo.imageUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
          )}
          <div className="flex flex-col items-center flex-1 gap-1">
            <h2 className="text-lg font-medium">
              {userInfo.userInfo.displayName || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {userInfo.userInfo.email}
            </p>
          </div>
        </div>
      )}
      <div className='flex flex-col gap-2'>
        <SettingsLinkButton />
        <StatsLinkButton />
        {/*
      <ImagesLinkButton />
      */}

        {!online && <OfflineUsageDialog />}
        {loggedIn.isLoggedIn ? <LogoutButton /> : <LoginButton />}
      </div>
      {/*
      <Link
        to='https://github.com/zsh-eng'
        className='mx-auto mt-24'
        target='_blank'
      >
        <div className='group flex text-muted-foreground gap-2'>
          <SiGithub className='' />
          <span className='group-hover:text-primary transition-all ease-out'>
            made by zsh-eng
          </span>
        </div>
      </Link>
      */}

    </div>
  );
}
