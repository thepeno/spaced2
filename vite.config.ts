import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Spaced',
        short_name: 'Spaced',
        description: 'Spaced is an app for spaced repetition using flashcards',
        theme_color: '#06B6D4',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '3024x1890',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '852x1724',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://spaced-backend-local.nordahltheo.workers.dev',
        changeOrigin: true,
        secure: true,
        headers: {
          'X-Forwarded-Host': 'localhost:5173',
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('Proxying request:', req.method, req.url);
            console.log('Request headers:', req.headers);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
            if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
              console.log('Response headers:', proxyRes.headers);
            }
          });
          proxy.on('error', (err, req) => {
            console.log('Proxy error:', err.message, req.url);
          });
        },
      }
    }
  },
});
