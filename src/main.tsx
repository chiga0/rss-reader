import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { registerServiceWorker } from '@lib/pwa';

// Register Service Worker for PWA capabilities
registerServiceWorker();

// Enable React StrictMode for development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
