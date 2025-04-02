import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Elevate(Her)',
    short_name: 'Elevate(Her)',
    description: 'Empowering women through coaching and community',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6B46C1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  }
} 