import { useGoogleSignInPrompt } from '@/components/hooks/google-sign-in-prompt';
import CommandBar from '@/components/nav/command-bar';
import NavBar from '@/components/nav/nav-bar.tsx';
import SessionExpiredBanner from '@/components/session-expired-banner';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner.tsx';
import SyncEngine from '@/lib/sync/engine.ts';
import { cn } from '@/lib/utils.ts';
import AllCardsRoute from '@/routes/AllCardsRoute';
import CreateFlashcardRoute from '@/routes/CreateFlashcardRoute.tsx';
import DeckRoute from '@/routes/DeckRoute.tsx';
import DecksRoute from '@/routes/DecksRoute.tsx';
import ImagesRoute from '@/routes/ImagesRoute';
import ImportRoute from '@/routes/ImportRoute';
import LoginSuccessRoute from '@/routes/LoginSuccessRoute';
import ProfileRoute from '@/routes/ProfileRoute';
import ReviewRoute from '@/routes/Review.tsx';
import SavedRoute from '@/routes/SavedRoute';
import StatsRoute from '@/routes/StatsRoute';
import { useMediaQuery } from '@uidotdev/usehooks';
import { WarningCircle, CheckCircle } from 'phosphor-react';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';

SyncEngine.start();
export default function App() {
  useGoogleSignInPrompt({ delay: 1000 });
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toaster
          position={isMobile ? 'top-center' : 'top-right'}
          icons={{
            success: <CheckCircle className='text-primary size-5' />,
            error: <WarningCircle className='text-destructive size-5' />,
            // close: <X className='text-muted-foreground size-3' />,
          }}
          theme='light'
          toastOptions={{
            closeButton: true,
            duration: 2000,
            unstyled: true,
            classNames: {
              toast:
                'bg-background rounded-xl w-80 py-4 pl-5 pr-4 shadow-sm flex gap-2 items-center',
              title: 'text-sm',
              description: 'text-xs',
              icon: 'size-4',
              actionButton:
                'text-xs font-semibold px-3 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer active:scale-95 transition-all',
            },
          }}
        />
        <CommandBar />
        <div
          className={cn(
            'w-screen flex flex-col justify-between',
            'md:pl-24 md:px-0 md:pt-8',
            'min-h-screen bg-background font-sans antialiased',
            'bg-muted dark:bg-background'
          )}
        >
          <SessionExpiredBanner />
          <div className='p-5 pb-20 md:pb-5 flex flex-col grow h-full w-full'>
            <Routes>
              <Route path='/' element={<ReviewRoute />} />
              <Route path='/decks' element={<DecksRoute />} />
              <Route path='/decks/_all' element={<AllCardsRoute />} />
              <Route path='/decks/:deckId' element={<DeckRoute />} />
              <Route path='/saved' element={<SavedRoute />} />
              {/* <Route path='/debug' element={<DebugRoute />} /> */}
              <Route path='/create' element={<CreateFlashcardRoute />} />
              <Route path='/profile' element={<ProfileRoute />} />
              <Route path='/stats' element={<StatsRoute />} />
              <Route path='/login-success' element={<LoginSuccessRoute />} />
              <Route path='/import' element={<ImportRoute />} />

              <Route path='/images' element={<ImagesRoute />} />
            </Routes>
          </div>
          <NavBar />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}
