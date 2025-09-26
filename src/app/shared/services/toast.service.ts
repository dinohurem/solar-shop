import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    duration?: number;
    showCloseButton?: boolean;
    progress?: number;
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

    showLoading(message: string, id?: string): string {
        const toastId = id || Date.now().toString();
        const toast: Toast = {
            id: toastId,
            message,
            type: 'loading',
            showCloseButton: false,
            progress: 0
        };

        const currentToasts = this.toasts.value;
        this.toasts.next([...currentToasts, toast]);
        return toastId;
    }

    updateLoadingProgress(id: string, message: string, progress: number): void {
        const currentToasts = this.toasts.value;
        const updatedToasts = currentToasts.map(toast =>
            toast.id === id
                ? { ...toast, message, progress: Math.min(100, Math.max(0, progress)) }
                : toast
        );
        this.toasts.next(updatedToasts);
    }

    completeLoading(id: string, successMessage: string): void {
        const currentToasts = this.toasts.value;
        const updatedToasts = currentToasts.map(toast =>
            toast.id === id
                ? {
                    ...toast,
                    message: successMessage,
                    type: 'success' as const,
                    showCloseButton: true,
                    progress: 100
                }
                : toast
        );
        this.toasts.next(updatedToasts);
    }

    failLoading(id: string, errorMessage: string): void {
        const currentToasts = this.toasts.value;
        const updatedToasts = currentToasts.map(toast =>
            toast.id === id
                ? {
                    ...toast,
                    message: errorMessage,
                    type: 'error' as const,
                    showCloseButton: true
                }
                : toast
        );
        this.toasts.next(updatedToasts);
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