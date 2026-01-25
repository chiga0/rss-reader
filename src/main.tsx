import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { logger } from '@lib/logger';
import { registerSW } from 'virtual:pwa-register';

// Log application startup
logger.info('Application starting', {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
});

// Register Service Worker with Workbox
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    logger.info('New content available; please refresh');
    // TODO: Show update notification to user
  },
  onOfflineReady() {
    logger.info('App ready to work offline');
  },
  onRegistered(registration) {
    logger.info('Service Worker registered', { scope: registration?.scope });
  },
  onRegisterError(error) {
    logger.error('Service Worker registration failed', { error });
  },
});

// Make updateSW available globally for manual updates
(window as any).__updateSW = updateSW;

// Enable React StrictMode for development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
