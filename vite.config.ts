import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // Optimize chunk size for faster loading
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('marked') || id.includes('turndown')) return 'markdown';
            if (id.includes('openai')) return 'ai';
            if (id.includes('cloudinary')) return 'cloudinary';
            return 'vendor';
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Source maps for debugging but not in production
    sourcemap: false
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev and production
    include: [
      'firebase/app',
      'firebase/firestore',
      'marked',
      'dompurify'
    ],
    // Exclude heavy dependencies that should be loaded on demand
    exclude: ['firebase/auth', 'openai']
  },
  resolve: {
    dedupe: ['svelte']
  }
});