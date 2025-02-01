import LoginScreen from '@/components/login.tsx';
import { NavigationBar } from '@/components/nav/nav-bar.tsx';
import SyncEngine from '@/lib/sync/engine.ts';
import { cn } from '@/lib/utils.ts';
import DeckRoute from '@/routes/DeckRoute.tsx';
import DecksRoute from '@/routes/DecksRoute.tsx';
import OpsRoute from '@/routes/Ops.tsx';
import ReviewRoute from '@/routes/Review.tsx';
import DebugRoute from '@/routes/Sync.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App.tsx';
import './index.css';

SyncEngine.start();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div
        className={cn(
          'grid grid-cols-12 gap-x-6 items-start',
          'px-2 md:px-0 pb-12',
          'min-h-screen grid-rows-[min-content_1fr] bg-background font-sans antialiased'
        )}
      >
        <NavigationBar />
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/review' element={<ReviewRoute />} />
          <Route path='/login' element={<LoginScreen />} />
          <Route path='/decks' element={<DecksRoute />} />
          <Route path='/decks/:deckId' element={<DeckRoute />} />
          <Route path='/debug' element={<DebugRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
);
