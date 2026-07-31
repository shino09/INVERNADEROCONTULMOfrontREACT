import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para el frontend React
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4300,
    proxy: {
      // Redirige las peticiones /api al backend .NET
      '/api': {
        target: 'http://localhost:5090',
        changeOrigin: true
      }
    }
  }
});
