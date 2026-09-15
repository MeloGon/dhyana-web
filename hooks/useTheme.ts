'use client';
import { useSyncExternalStore } from 'react';

const eventName = 'dhyana-theme-change';
function storedTheme() { try { return localStorage.getItem('dhyana-theme'); } catch { return null; } }
function subscribe(notify: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const sync = () => {
    const saved = storedTheme();
    document.documentElement.classList.toggle('dark', saved === 'dark' || (saved !== 'light' && query.matches));
    notify();
  };
  window.addEventListener(eventName, notify);
  window.addEventListener('storage', sync);
  query.addEventListener('change', sync);
  return () => { window.removeEventListener(eventName, notify); window.removeEventListener('storage', sync); query.removeEventListener('change', sync); };
}

export function useTheme() {
  // La clase del documento es el estado compartido; no hace falta un Context global.
  const isDark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('dark'), () => false);
  const toggle = () => {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('dhyana-theme', dark ? 'dark' : 'light'); } catch { /* Funciona también sin almacenamiento disponible. */ }
    window.dispatchEvent(new Event(eventName));
  };
  return { isDark, toggle };
}
