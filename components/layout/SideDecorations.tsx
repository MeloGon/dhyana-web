'use client';

import { useEffect, useState } from 'react';

/**
 * Decoraciones botánicas zen en los laterales de la pantalla.
 * Presentan sutil movimiento de parallax reactivo al scroll y una oscilación
 * suave inspirada en la respiración y calma de Dhyana.
 * Visibles en pantallas medianas/grandes (>= 1280px) en los márgenes exteriores
 * para no interferir con la lectura ni el contenido central.
 */
export default function SideDecorations() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || window.pageYOffset);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desplazamiento parallax suave diferencial para dar profundidad
  const leftParallax = (scrollY * 0.08) % 300;
  const rightParallax = (scrollY * 0.12) % 350;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden hidden xl:block select-none"
    >
      {/* Enredadera Izquierda */}
      <div
        className="absolute top-0 left-0 w-36 2xl:w-48 transition-transform duration-300 ease-out opacity-40 dark:opacity-30"
        style={{
          transform: `translate3d(0, -${leftParallax}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 160 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-[0_4px_12px_rgba(99,102,241,0.15)] animate-zen-sway"
        >
          <defs>
            <linearGradient id="vine-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="leaf-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Tallo principal ondulado */}
          <path
            d="M 10 -20 Q 45 100, 20 220 T 40 450 T 15 680 T 35 900"
            stroke="url(#vine-grad-left)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Tallo secundario entrelazado */}
          <path
            d="M 0 30 Q 30 140, 12 280 T 30 520 T 10 760"
            stroke="url(#vine-grad-left)"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeOpacity="0.6"
          />

          {/* Hojas y zarcillos a lo largo del tallo */}
          {/* Nodo 1 */}
          <path
            d="M 22 80 C 45 65, 70 85, 75 105 C 55 110, 30 95, 22 80 Z"
            fill="url(#leaf-grad-left)"
          />
          <path d="M 22 80 Q 48 88, 75 105" stroke="currentColor" strokeWidth="1" className="text-white/40" />

          {/* Zarcillo rizado 1 */}
          <path
            d="M 24 130 C 50 120, 65 140, 60 155 C 55 165, 42 160, 48 150"
            stroke="url(#vine-grad-left)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Nodo 2 */}
          <path
            d="M 18 190 C -5 210, 5 240, 25 245 C 30 225, 25 200, 18 190 Z"
            fill="url(#leaf-grad-left)"
          />
          <path
            d="M 20 225 C 50 220, 85 245, 90 270 C 65 275, 40 255, 20 225 Z"
            fill="url(#leaf-grad-left)"
          />
          <path d="M 20 225 Q 55 245, 90 270" stroke="currentColor" strokeWidth="1" className="text-white/40" />

          {/* Nodo 3 */}
          <path
            d="M 30 330 C 60 320, 80 345, 82 368 C 60 372, 38 350, 30 330 Z"
            fill="url(#leaf-grad-left)"
          />
          <path
            d="M 32 390 C 10 405, 5 435, 25 445 C 38 430, 40 405, 32 390 Z"
            fill="url(#leaf-grad-left)"
          />

          {/* Zarcillo rizado 2 */}
          <path
            d="M 38 430 C 70 420, 90 450, 80 470 C 72 485, 58 478, 64 466"
            stroke="url(#vine-grad-left)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Nodo 4 */}
          <path
            d="M 26 510 C 60 495, 92 525, 95 550 C 70 560, 42 535, 26 510 Z"
            fill="url(#leaf-grad-left)"
          />
          <path d="M 26 510 Q 60 530, 95 550" stroke="currentColor" strokeWidth="1" className="text-white/40" />

          {/* Nodo 5 */}
          <path
            d="M 18 610 C -2 625, 2 655, 24 662 C 32 645, 28 622, 18 610 Z"
            fill="url(#leaf-grad-left)"
          />
          <path
            d="M 16 670 C 45 660, 75 685, 78 710 C 55 715, 32 695, 16 670 Z"
            fill="url(#leaf-grad-left)"
          />

          {/* Nodo 6 */}
          <path
            d="M 26 770 C 60 755, 88 785, 90 810 C 68 818, 40 795, 26 770 Z"
            fill="url(#leaf-grad-left)"
          />
          <path
            d="M 30 840 C 8 855, 10 885, 32 892 C 40 875, 38 852, 30 840 Z"
            fill="url(#leaf-grad-left)"
          />
        </svg>
      </div>

      {/* Enredadera Derecha */}
      <div
        className="absolute top-0 right-0 w-36 2xl:w-48 transition-transform duration-300 ease-out opacity-40 dark:opacity-30"
        style={{
          transform: `translate3d(0, -${rightParallax}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 160 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-[0_4px_12px_rgba(139,92,246,0.15)] animate-zen-sway [animation-delay:-4.5s]"
        >
          <defs>
            <linearGradient id="vine-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="leaf-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Tallo principal ondulado derecho */}
          <path
            d="M 150 -20 Q 115 120, 140 250 T 120 480 T 145 710 T 125 900"
            stroke="url(#vine-grad-right)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Tallo secundario entrelazado derecho */}
          <path
            d="M 160 40 Q 130 160, 148 300 T 130 540 T 150 780"
            stroke="url(#vine-grad-right)"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeOpacity="0.6"
          />

          {/* Hojas y zarcillos a lo largo del tallo derecho */}
          {/* Nodo 1 */}
          <path
            d="M 138 95 C 115 75, 90 95, 85 118 C 105 122, 130 108, 138 95 Z"
            fill="url(#leaf-grad-right)"
          />
          <path d="M 138 95 Q 112 105, 85 118" stroke="currentColor" strokeWidth="1" className="text-white/40" />

          {/* Zarcillo rizado derecho 1 */}
          <path
            d="M 136 150 C 110 140, 95 160, 100 175 C 105 185, 118 180, 112 170"
            stroke="url(#vine-grad-right)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Nodo 2 */}
          <path
            d="M 140 230 C 110 220, 75 245, 70 270 C 95 275, 120 255, 140 230 Z"
            fill="url(#leaf-grad-right)"
          />
          <path d="M 140 230 Q 105 250, 70 270" stroke="currentColor" strokeWidth="1" className="text-white/40" />

          {/* Nodo 3 */}
          <path
            d="M 128 350 C 98 340, 78 365, 76 388 C 98 392, 120 370, 128 350 Z"
            fill="url(#leaf-grad-right)"
          />
          <path
            d="M 126 410 C 148 425, 153 455, 133 465 C 120 450, 118 425, 126 410 Z"
            fill="url(#leaf-grad-right)"
          />

          {/* Zarcillo rizado derecho 2 */}
          <path
            d="M 122 450 C 90 440, 70 470, 80 490 C 88 505, 102 498, 96 486"
            stroke="url(#vine-grad-right)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Nodo 4 */}
          <path
            d="M 134 530 C 100 515, 68 545, 65 570 C 90 580, 118 555, 134 530 Z"
            fill="url(#leaf-grad-right)"
          />
          <path d="M 134 530 Q 100 550, 65 570" stroke="currentColor" strokeWidth="1" className="text-white/40" />

          {/* Nodo 5 */}
          <path
            d="M 142 630 C 162 645, 158 675, 136 682 C 128 665, 132 642, 142 630 Z"
            fill="url(#leaf-grad-right)"
          />
          <path
            d="M 144 690 C 115 680, 85 705, 82 730 C 105 735, 128 715, 144 690 Z"
            fill="url(#leaf-grad-right)"
          />

          {/* Nodo 6 */}
          <path
            d="M 134 790 C 100 775, 72 805, 70 830 C 92 838, 120 815, 134 790 Z"
            fill="url(#leaf-grad-right)"
          />
          <path
            d="M 130 860 C 152 875, 150 905, 128 912 C 120 895, 122 872, 130 860 Z"
            fill="url(#leaf-grad-right)"
          />
        </svg>
      </div>
    </div>
  );
}
