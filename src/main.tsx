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
    // Show update notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('更新可用', {
        body: '有新版本可用，请刷新页面获取最新内容',
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

// Make updateSW available globally for manual updates
(window as any).__updateSW = updateSW;

// Hide loading screen when React app renders
function hideLoadingScreen() {
  const loadingElement = document.getElementById('app-loading');
  if (loadingElement) {
    loadingElement.classList.add('hide');
    setTimeout(() => {
      loadingElement.remove();
    }, 300);
  }
}

// Enable React StrictMode for development
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Hide loading screen after a short delay to ensure smooth transition
setTimeout(hideLoadingScreen, 100);
