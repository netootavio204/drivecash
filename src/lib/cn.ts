import { clsx, type ClassValue } from 'clsx';

/** Junta classes CSS condicionalmente. */
export function cn(...classes: ClassValue[]): string {
  return clsx(classes);
}
