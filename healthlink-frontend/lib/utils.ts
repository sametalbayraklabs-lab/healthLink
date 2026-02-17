import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'dd MMMM yyyy'): string {
    // Backend stores wall-clock time marked as UTC for PostgreSQL compatibility.
    // Strip timezone suffix so parseISO treats it as local time (no UTC→local conversion).
    const cleaned = typeof date === 'string' ? date.replace(/Z$|[+-]\d{2}:\d{2}$/, '') : date;
    const dateObj = typeof cleaned === 'string' ? parseISO(cleaned) : cleaned;
    return format(dateObj, formatStr, { locale: tr });
}

export function formatDateTime(date: string | Date): string {
    return formatDate(date, 'dd MMMM yyyy HH:mm');
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
