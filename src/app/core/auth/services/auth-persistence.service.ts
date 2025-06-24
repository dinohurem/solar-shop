import { Injectable } from '@angular/core';
import { User } from '../../../shared/models/user.model';

interface PersistedAuthState {
    token: string;
    user: User;
    loggedIn: boolean;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthPersistenceService {
    private readonly AUTH_STORAGE_KEY = 'solar_shop_auth_state';
    private readonly EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

    saveAuthState(token: string, user: User): void {
        try {
            const authState: PersistedAuthState = {
                token,
                user,
                loggedIn: true,
                timestamp: Date.now()
            };
            localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(authState));
        } catch (error) {
            console.warn('Failed to save auth state to localStorage:', error);
        }
    }

    loadAuthState(): PersistedAuthState | null {
        try {
            const stored = localStorage.getItem(this.AUTH_STORAGE_KEY);
            if (!stored) return null;

            const authState: PersistedAuthState = JSON.parse(stored);

            // Check if the stored state is expired
            if (Date.now() - authState.timestamp > this.EXPIRY_TIME) {
                this.clearAuthState();
                return null;
            }

            return authState;
        } catch (error) {
            console.warn('Failed to load auth state from localStorage:', error);
            this.clearAuthState();
            return null;
        }
    }

    clearAuthState(): void {
        try {
            localStorage.removeItem(this.AUTH_STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear auth state from localStorage:', error);
        }
    }

    isAuthStateExpired(): boolean {
        const authState = this.loadAuthState();
        return !authState;
    }
} 