import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages, our workflow runs
//   npm run build -- --base=/loftbook/
// so we don't hardcode base here.
export default defineConfig({
  plugins: [react()]
})
