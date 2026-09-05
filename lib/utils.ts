import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn() combina clases de Tailwind condicionales sin que se pisen entre sí.
// Es el equivalente a concatenar/priorizar estilos en Flutter, pero para strings de CSS.
// Convención estándar en casi todo proyecto Next.js/Tailwind — vas a ver este helper reusado seguido.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
