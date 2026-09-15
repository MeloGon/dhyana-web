'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return <button type="button" onClick={toggle} aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'} title={isDark ? 'Modo claro' : 'Modo oscuro'} className="rounded-xl p-2 hover:bg-[#83D0C6]/15">
    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
  </button>;
}
