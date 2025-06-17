import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts = new BehaviorSubject<Toast[]>([]);

    toasts$ = this.toasts.asObservable();

    showSuccess(message: string, duration: number = 3000): void {
        this.showToast(message, 'success', duration);
    }

    showError(message: string, duration: number = 5000): void {
        this.showToast(message, 'error', duration);
    }

    showWarning(message: string, duration: number = 4000): void {
        this.showToast(message, 'warning', duration);
    }

    showInfo(message: string, duration: number = 3000): void {
        this.showToast(message, 'info', duration);
    }

    private showToast(message: string, type: Toast['type'], duration: number): void {
        const toast: Toast = {
            id: Date.now().toString(),
            message,
            type,
            duration
        };

        const currentToasts = this.toasts.value;
        this.toasts.next([...currentToasts, toast]);

        // Auto remove toast after duration
        setTimeout(() => {
            this.removeToast(toast.id);
        }, duration);
    }

    removeToast(id: string): void {
        const currentToasts = this.toasts.value;
        this.toasts.next(currentToasts.filter(toast => toast.id !== id));
    }

    clear(): void {
        this.toasts.next([]);
    }
} 