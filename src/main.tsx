import LoginScreen from '@/components/login.tsx';
import NavBar from '@/components/nav/nav-bar.tsx';
import { SpacedIcon } from '@/components/nav/spaced-icon';
import SyncEngine from '@/lib/sync/engine.ts';
import { cn } from '@/lib/utils.ts';
import BookmarksRoute from '@/routes/BookmarksRoute.tsx';
import CreateFlashcardRoute from '@/routes/CreateFlashcardRoute.tsx';
import DeckRoute from '@/routes/DeckRoute.tsx';
import DecksRoute from '@/routes/DecksRoute.tsx';
import ReviewRoute from '@/routes/Review.tsx';
import ProfileRoute from '@/routes/ProfileRoute';
import DebugRoute from '@/routes/Sync.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';

SyncEngine.start();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div
        className={cn(
          'grid grid-cols-12 gap-x-6 items-start',
          'px-2 md:px-0 pb-12 pt-20 md:pt-8',
          'min-h-screen grid-rows-[min-content_1fr] bg-background font-sans antialiased',
          'bg-muted'
        )}
      >
        <SpacedIcon />
        <NavBar />
        <Routes>
          <Route path='/' element={<ReviewRoute />} />
          <Route path='/login' element={<LoginScreen />} />
          <Route path='/decks' element={<DecksRoute />} />
          <Route path='/decks/:deckId' element={<DeckRoute />} />
          <Route path='/bookmarks' element={<BookmarksRoute />} />
          <Route path='/debug' element={<DebugRoute />} />
          <Route path='/create' element={<CreateFlashcardRoute />} />
          <Route path='/profile' element={<ProfileRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
);
