import LoginScreen from '@/components/login.tsx';
import MeRoute from '@/routes/Me.tsx';
import OpsRoute from '@/routes/Ops.tsx';
import ReviewRoute from '@/routes/Review.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/review' element={<ReviewRoute />} />
        <Route path='/ops' element={<OpsRoute />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/me' element={<MeRoute />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
