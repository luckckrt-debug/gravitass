import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Standard Indian Rupee (INR) Formatter for GRAVITASS Marketplace Services
 * Formats: ₹500, ₹1,500, ₹25,000, ₹1,00,000
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Converts a string into a clean URL-friendly slug
 * e.g. "Programming & Tech" -> "programming-tech", "UI/UX Design" -> "ui-ux-design"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[\/\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a slug back into human-readable capitalized text
 */
export function unslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getBadgeDetails(badge: string) {
  switch (badge) {
    case 'elite_talent':
      return {
        label: 'Elite Talent',
        gradient: 'from-amber-400 to-amber-600',
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        bg: 'bg-amber-500/10'
      };
    case 'top_rated':
      return {
        label: 'Top Rated',
        gradient: 'from-violet-500 to-purple-600',
        border: 'border-violet-500/40',
        text: 'text-violet-300',
        bg: 'bg-violet-500/10'
      };
    case 'rising_talent':
      return {
        label: 'Rising Talent',
        gradient: 'from-cyan-400 to-blue-600',
        border: 'border-cyan-500/40',
        text: 'text-cyan-300',
        bg: 'bg-cyan-500/10'
      };
    case 'verified':
    default:
      return {
        label: 'Verified Pro',
        gradient: 'from-emerald-400 to-teal-600',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        bg: 'bg-emerald-500/10'
      };
  }
}
