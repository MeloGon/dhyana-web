import type { HeroVideoSource } from '@/lib/types';

// Escenas de video de fondo del Hero. Para cambiar el video de portada,
// se edita esta lista — no hace falta tocar el componente.
export const HERO_VIDEOS: HeroVideoSource[] = [
  {
    id: 'ocean',
    name: 'Olas y Costa Serena',
    url: 'https://cdn.pixabay.com/video/2020/05/25/40149-425026938_large.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'clouds',
    name: 'Cielo y Nubes en Paz',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    poster: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'forest',
    name: 'Bosque y Luz Suave',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-sun-rays-through-the-trees-in-a-forest-41130-large.mp4',
    poster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
  },
];
