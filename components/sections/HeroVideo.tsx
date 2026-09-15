'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { HERO_VIDEOS } from '@/lib/data/hero-videos';
import { visibleSiteLinks } from '@/lib/site-navigation';
import type { SiteContent } from '@/lib/types/site-settings';

interface HeroVideoProps {
  content: SiteContent;
  onScrollTo: (sectionId: string) => void;
}

export default function HeroVideo({ content, onScrollTo }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const { texts, visibility } = content.settings;
  const nextSection = visibleSiteLinks(content.settings).find((link) => link.id !== 'inicio');
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setIsPlaying(false));
    else video.pause();
  };
  return <section id="inicio" className="relative flex min-h-[640px] h-[calc(100svh-80px)] max-h-[1080px] w-full items-center justify-center overflow-hidden bg-[#3D4C5A]">
    <video ref={videoRef} id="hero-background-video" className="absolute inset-0 z-0 h-full w-full object-cover" src={content.videoUrl || HERO_VIDEOS[0].url} autoPlay loop muted={isMuted} playsInline poster={HERO_VIDEOS[0].poster} onPlay={() => { setIsPlaying(true); setVideoError(false); }} onPause={() => setIsPlaying(false)} onError={() => { setIsPlaying(false); setVideoError(true); }} />
    <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#3D4C5A]/75 via-[#3D4C5A]/60 to-[#3D4C5A]/85" />
    <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 text-center sm:px-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 backdrop-blur-md"><Sparkles className="h-3.5 w-3.5 shrink-0 text-[#83D0C6]" /><span className="text-xs font-medium uppercase tracking-widest text-[#84B0DF]">{texts.heroEyebrow}</span></div>
      <h1 className="mb-5 max-w-4xl font-serif text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl">{texts.heroTitle}</h1>
      <p className="mb-8 max-w-2xl whitespace-pre-line text-base font-light leading-relaxed text-white/90 sm:text-lg md:text-xl">{texts.heroSubtitle}</p>
      {!videoError && <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'} className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/10 text-white transition hover:scale-105 hover:bg-white/20">{isPlaying ? <Pause /> : <Play />}</button>}
      <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
        {visibility.talleres && <button id="hero-cta-talleres" onClick={() => onScrollTo('talleres')} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--mint-solid)] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[color:var(--ink)] hover:opacity-90 sm:w-auto">Talleres<ArrowRight className="h-4 w-4" /></button>}
        {visibility['sobre-nosotros'] && <button onClick={() => onScrollTo('sobre-nosotros')} className="rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/20">Conoce nuestro enfoque</button>}
      </div>
    </div>
    {!videoError && <button onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Activar sonido' : 'Silenciar'} className="absolute right-5 bottom-5 z-20 rounded-full border border-white/20 bg-[#3D4C5A]/80 p-3 text-white">{isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>}
    {nextSection && <button onClick={() => onScrollTo(nextSection.id)} className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/75 hover:text-white" aria-label={`Descubrir ${nextSection.label}`}><span className="text-xs uppercase tracking-widest">Descubrir</span><ChevronDown className="h-5 w-5" /></button>}
  </section>;
}
