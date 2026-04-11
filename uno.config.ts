import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
  ],
  theme: {
    colors: {
      primary: '#FF6B35',
      secondary: '#F7C948',
      accent: '#4ECDC4',
      dark: '#2C3E50',
      light: '#FFF8F0',
    },
  },
})
