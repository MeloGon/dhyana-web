'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronDown, Sparkles, ArrowRight, ShieldCheck, Heart, Users } from 'lucide-react';
import { HERO_VIDEOS } from '@/lib/data/hero-videos';

// Sección Hero: video de fondo a pantalla completa con controles de
// play/pause/mute y selector de escena. `videoRef` (useRef) es una referencia
// directa al elemento <video> del DOM — como un GlobalKey en Flutter, sirve
// para llamar métodos imperativos (.play(), .pause()) que React no maneja
// por su cuenta vía estado.
// Las escenas de video se editan en lib/data/hero-videos.ts.
interface HeroVideoProps {
  onScrollTo: (sectionId: string) => void;
}

export default function HeroVideo({ onScrollTo }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoSelect = (idx: number) => {
    setCurrentVideoIdx(idx);
  };

  // Corre cada vez que cambia currentVideoIdx (dependencia en el array [ ]):
  // recarga y reproduce el nuevo video. Equivalente a un didUpdateWidget en
  // Flutter que reacciona cuando cambia una prop específica.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may require muted
        setIsPlaying(true);
      });
    }
  }, [currentVideoIdx]);

  return (
    <section
      id="inicio"
      className="relative w-full h-screen min-h-[640px] max-h-[1080px] flex items-center justify-center overflow-hidden bg-[#3D4C5A]"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        id="hero-background-video"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster={HERO_VIDEOS[currentVideoIdx].poster}
      >
        <source src={HERO_VIDEOS[currentVideoIdx].url} type="video/mp4" />
        Tu navegador no soporta reproducción de video.
      </video>

      {/* Aesthetic Overlay with Depth and Calm Slate Tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3D4C5A]/75 via-[#3D4C5A]/60 to-[#3D4C5A]/85 z-10 backdrop-blur-[0.5px]" />

      {/* Main Hero Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Editorial Sub-eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <Sparkles className="w-3.5 h-3.5 text-[#83D0C6]" />
          <span className="font-sans text-xs uppercase tracking-widest text-[#84B0DF] font-medium">
            Terapia Consciente & Acompañamiento
          </span>
        </div>

        {/* High Contrast Editorial Serif Title */}
        <h1 className="font-serif italic text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-4 drop-shadow-sm max-w-4xl">
          Tu bienestar emocional es nuestra prioridad.
        </h1>

        {/* Subtitle in light sky-blue */}
        <p className="font-sans text-base sm:text-lg md:text-xl text-[#84B0DF] font-light max-w-2xl leading-relaxed mb-6">
          Encuentra el equilibrio interno a través de la psicoterapia consciente, rigurosa y humana.
        </p>

        {/* Central Editorial Video Play Indicator Ring */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar Video' : 'Reproducir Video'}
            className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-white/10 backdrop-blur-sm cursor-pointer hover:scale-105 hover:bg-white/20 transition-all shadow-lg group"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white group-hover:text-[#83D0C6] transition-colors" />
            ) : (
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1 group-hover:border-l-[#83D0C6] transition-colors" />
            )}
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          <button
            id="hero-cta-contacto"
            onClick={() => onScrollTo('contacto')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-sans font-semibold text-sm uppercase tracking-wider bg-[#83D0C6] text-white hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span>Agendar Cita</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-cta-talleres"
            onClick={() => onScrollTo('talleres')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-sans font-medium text-sm uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 border border-white/25 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#83D0C6]" />
            <span>Espacios & Talleres</span>
          </button>

          <button
            id="hero-cta-sobre-mi"
            onClick={() => onScrollTo('sobre-mi')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-sans font-medium text-xs uppercase tracking-wider text-[#F7F7F5]/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span>Conoce Mi Enfoque</span>
          </button>
        </div>

        {/* Editorial Monospace Stamp & Trust Badges */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/15 w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white/70 text-xs font-mono tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#83D0C6] shrink-0" />
            <span>Colegiado Nº M-34821</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#84B0DF] shrink-0" />
            <span>Presencial & Online</span>
          </div>
          <div className="text-white/50 text-[11px]">
            Video de Presentación | 01:45
          </div>
        </div>
      </div>

      {/* Video Interactive Controls Widget (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 bg-[#3D4C5A]/80 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-white shadow-lg">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={isPlaying ? 'Pausar video' : 'Reproducir video'}
          aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Theme Scenes */}
        <div className="flex items-center gap-1 pl-1 border-l border-white/20">
          {HERO_VIDEOS.map((vid, idx) => (
            <button
              key={vid.id}
              onClick={() => handleVideoSelect(idx)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                currentVideoIdx === idx
                  ? 'bg-[#83D0C6] text-[#3D4C5A] font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={vid.name}
            >
              {vid.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={() => onScrollTo('sobre-mi')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer group"
        aria-label="Desplazarse hacia abajo"
      >
        <span className="text-xs font-sans tracking-widest uppercase opacity-75">Descubrir</span>
        <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-[#83D0C6]" />
      </button>
    </section>
  );
}
