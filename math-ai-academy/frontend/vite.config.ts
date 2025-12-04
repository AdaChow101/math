import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: !isProduction ? {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        }
      } : undefined
    },
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts']
          }
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});