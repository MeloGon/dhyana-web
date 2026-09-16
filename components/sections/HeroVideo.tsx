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

function renderHeroTitle(title: string) {
  if (title.includes('\n')) {
    const [first, ...rest] = title.split('\n');
    return (
      <>
        <span className="block font-serif italic text-white">{first}</span>
        <span className="block font-sans font-extrabold bg-gradient-to-r from-[#06B6D4] via-[#6366F1] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent mt-1">
          {rest.join('\n')}
        </span>
      </>
    );
  }
  const match = title.match(/^(.*?\bes\b)\s*(.*)$/i) || title.match(/^(.*?)\s+(nuestra prioridad\.?)$/i);
  if (match) {
    return (
      <>
        <span className="block font-serif italic text-white">{match[1]}</span>
        <span className="block font-sans font-extrabold bg-gradient-to-r from-[#06B6D4] via-[#6366F1] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent mt-1">
          {match[2]}
        </span>
      </>
    );
  }
  return <span className="font-serif italic text-white">{title}</span>;
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
  return <section id="inicio" className="relative flex min-h-[640px] h-[calc(100svh-80px)] max-h-[1080px] w-full items-center justify-center overflow-hidden bg-[#111827]">
    <video ref={videoRef} id="hero-background-video" className="absolute inset-0 z-0 h-full w-full object-cover" src={content.videoUrl || HERO_VIDEOS[0].url} autoPlay loop muted={isMuted} playsInline poster={HERO_VIDEOS[0].poster} onPlay={() => { setIsPlaying(true); setVideoError(false); }} onPause={() => setIsPlaying(false)} onError={() => { setIsPlaying(false); setVideoError(true); }} />
    <div className="hero-overlay-cosmic absolute inset-0 z-10" />
    <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 text-center sm:px-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6366F1]/40 bg-[#1E1B4B]/60 px-5 py-1.5 backdrop-blur-md shadow-xs">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white">{texts.heroEyebrow}</span>
      </div>
      <h1 className="mb-5 max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
        {renderHeroTitle(texts.heroTitle)}
      </h1>
      <p className="mb-8 max-w-2xl whitespace-pre-line text-base font-light leading-relaxed text-white/90 sm:text-lg md:text-xl">{texts.heroSubtitle}</p>
      {!videoError && <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'} className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/10 text-white transition hover:scale-105 hover:bg-white/20">{isPlaying ? <Pause /> : <Play />}</button>}
      <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
        {visibility.talleres && <button id="hero-cta-talleres" onClick={() => onScrollTo('talleres')} className="btn-cosmic-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white sm:w-auto">Talleres<ArrowRight className="h-4 w-4" /></button>}
        {visibility['sobre-nosotros'] && <button onClick={() => onScrollTo('sobre-nosotros')} className="rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/20 backdrop-blur-xs">Conoce nuestro enfoque</button>}
      </div>
    </div>
    {!videoError && <button onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Activar sonido' : 'Silenciar'} className="absolute right-5 bottom-5 z-20 rounded-full border border-white/20 bg-[#111827]/80 p-3 text-white backdrop-blur-xs">{isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>}
    {nextSection && <button onClick={() => onScrollTo(nextSection.id)} className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/75 hover:text-white" aria-label={`Descubrir ${nextSection.label}`}><span className="text-xs uppercase tracking-widest">Descubrir</span><ChevronDown className="h-5 w-5" /></button>}
  </section>;
}
