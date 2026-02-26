import { defineConfig } from 'vite';
import type { PluginOption, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite plugin that adds a server middleware to proxy AI API requests,
 * avoiding browser CORS restrictions when calling external AI endpoints.
 */
function aiProxyPlugin(): PluginOption {
  return {
    name: 'ai-proxy',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/ai-proxy', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const targetUrl = req.headers['x-target-url'];
        if (!targetUrl || typeof targetUrl !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing X-Target-URL header' }));
          return;
        }

        // Read request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const body = Buffer.concat(chunks).toString();

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          const apiKey = req.headers['x-api-key'];
          if (apiKey && typeof apiKey === 'string') {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body,
          });

          const responseText = await response.text();
          res.writeHead(response.status, {
            'Content-Type': response.headers.get('content-type') || 'application/json',
          });
          res.end(responseText);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Proxy request failed';
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    aiProxyPlugin(),
    basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/workers',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: false, // Using existing manifest.json in public/
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@models': resolve(__dirname, './src/models'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@styles': resolve(__dirname, './src/styles'),
      '@lib': resolve(__dirname, './src/lib'),
    },
  },
  server: {
    port: 5173,
    https: true,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'state-management': ['zustand'],
          'ui-components': ['lucide-react', 'dompurify'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
    exclude: ['@fontsource-variable/noto-sans'],
  },
});
