import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT:
// We do NOT hardcode "base" here.
// GitHub Pages workflow will build with:
//    vite build --base=/loftbook/

export default defineConfig({
  plugins: [react()]
})
