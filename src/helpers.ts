import { format } from 'date-fns';

export function isDev(): boolean {
    return process.env.NODE_ENV !== 'production';
}

export function formatDate(date: Date): string {
    return format(date, 'HH:mm:ss dd-MM-yyyy')
}
