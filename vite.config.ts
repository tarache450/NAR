import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.NODE_ENV === 'production' ? '/NAR/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      target: 'es2022',
      cssMinify: true,
      rollupOptions: {
        output: {
          // Separa librerías grandes para que se cacheen aparte del código de NAR
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('motion') || id.includes('framer')) return 'vendor-motion';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
