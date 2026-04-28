import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/CPSC481_personalProject/',
  plugins: [react()],
});
