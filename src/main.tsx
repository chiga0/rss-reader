import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './locales'; // Initialize i18n
import i18n from './locales';
import { logger } from '@lib/logger';
import { registerSW } from 'virtual:pwa-register';

logger.info('Application starting', {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
});

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    logger.info('New content available; please refresh');
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(i18n.t('settings:version.newVersion'), {
        body: i18n.t('settings:version.newVersion'),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      });
    }
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

(window as any).__updateSW = updateSW;

function hideLoadingScreen() {
  const loadingElement = document.getElementById('app-loading');
  if (loadingElement) {
    loadingElement.classList.add('hide');
    setTimeout(() => {
      loadingElement.remove();
    }, 300);
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    hideLoadingScreen();
  });
});
