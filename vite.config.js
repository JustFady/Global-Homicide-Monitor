import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Global-Homicide-Monitor/',
  plugins: [react()],
  root: '.',
});
