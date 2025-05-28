import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Database } from '../shared/models/database.model';
import {
    AuthUser,
    AuthSession,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ResetPasswordRequest,
    UserProfile
} from '../shared/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient<Database>;
    private currentUser = new BehaviorSubject<AuthUser | null>(null);
    private currentSession = new BehaviorSubject<AuthSession | null>(null);

    constructor() {
        this.supabase = createClient<Database>(
            environment.supabaseUrl,
            environment.supabaseKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );

        // Initialize auth state
        this.supabase.auth.onAuthStateChange((event, session) => {
            try {
                this.currentUser.next(session?.user as AuthUser ?? null);
                this.currentSession.next(session as AuthSession ?? null);
            } catch (error: any) {
                if (error.name !== 'NavigatorLockAcquireTimeoutError') {
                    console.error('Auth state change error:', error);
                } else {
                    console.warn('Navigator lock timeout (harmless in dev):', error);
                }
            }
        });
    }

    // Auth methods
    async signIn(request: LoginRequest): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: request.email,
                password: request.password,
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return {
                user: data.user as AuthUser,
                session: data.session as AuthSession,
                error: undefined
            };
        } catch (error: any) {
            return { user: null, session: null, error: error.message };
        }
    }

    async signUp(request: RegisterRequest): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: request.email,
                password: request.password,
                options: {
                    data: {
                        firstName: request.firstName,
                        lastName: request.lastName,
                        phone: request.phone
                    }
                }
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return {
                user: data.user as AuthUser,
                session: data.session as AuthSession,
                error: undefined
            };
        } catch (error: any) {
            return { user: null, session: null, error: error.message };
        }
    }

    async signOut(): Promise<{ error?: string }> {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                return { error: error.message };
            }
            return {};
        } catch (error: any) {
            return { error: error.message };
        }
    }

    async resetPassword(request: ResetPasswordRequest): Promise<{ error?: string }> {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(request.email);
            if (error) {
                return { error: error.message };
            }
            return {};
        } catch (error: any) {
            return { error: error.message };
        }
    }

    async updatePassword(password: string): Promise<{ error?: string }> {
        try {
            const { error } = await this.supabase.auth.updateUser({ password });
            if (error) {
                return { error: error.message };
            }
            return {};
        } catch (error: any) {
            return { error: error.message };
        }
    }

    // Profile methods
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(profile)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return null;
        }
    }

    // Generic data methods with type safety
    async getTable<T extends keyof Database['public']['Tables']>(
        tableName: T,
        filters?: Record<string, any>
    ): Promise<Database['public']['Tables'][T]['Row'][]> {
        let query = this.supabase.from(tableName).select('*');

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'in' in value) {
                    query = query.in(key, value.in as readonly any[]);
                } else {
                    query = query.eq(key, value);
                }
            });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Database['public']['Tables'][T]['Row'][];
    }

    async getTableById<T extends keyof Database['public']['Tables']>(
        tableName: T,
        id: string
    ): Promise<Database['public']['Tables'][T]['Row'] | null> {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Database['public']['Tables'][T]['Row'];
    }

    async createRecord<T extends keyof Database['public']['Tables']>(
        tableName: T,
        record: Database['public']['Tables'][T]['Insert']
    ): Promise<Database['public']['Tables'][T]['Row'] | null> {
        const { data, error } = await this.supabase
            .from(tableName)
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data as Database['public']['Tables'][T]['Row'];
    }

    async updateRecord<T extends keyof Database['public']['Tables']>(
        tableName: T,
        id: string,
        record: Database['public']['Tables'][T]['Update']
    ): Promise<Database['public']['Tables'][T]['Row'] | null> {
        const { data, error } = await this.supabase
            .from(tableName)
            .update(record)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Database['public']['Tables'][T]['Row'];
    }

    async deleteRecord<T extends keyof Database['public']['Tables']>(
        tableName: T,
        id: string
    ): Promise<void> {
        const { error } = await this.supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Specific business logic methods
    async getProducts(filters?: {
        categoryId?: string;
        featured?: boolean;
        onSale?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        let query = this.supabase
            .from('products')
            .select(`
                *,
                categories:category_id (
                    id,
                    name,
                    slug
                )
            `)
            .eq('is_active', true);

        if (filters?.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.featured !== undefined) {
            query = query.eq('is_featured', filters.featured);
        }
        if (filters?.onSale !== undefined) {
            query = query.eq('is_on_sale', filters.onSale);
        }
        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async getCategories(activeOnly: boolean = true) {
        let query = this.supabase
            .from('categories')
            .select('*');

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    }

    async getActiveOffers() {
        const { data, error } = await this.supabase
            .from('offers')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'active')
            .lte('start_date', new Date().toISOString())
            .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
            .order('priority', { ascending: true });

        if (error) throw error;
        return data;
    }

    async getCartItems(userId?: string, sessionId?: string) {
        let query = this.supabase
            .from('cart_items')
            .select(`
                *,
                products:product_id (
                    id,
                    name,
                    price,
                    images,
                    sku
                )
            `);

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (sessionId) {
            query = query.eq('session_id', sessionId);
        } else {
            throw new Error('Either userId or sessionId must be provided');
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async addToCart(productId: string, quantity: number, price: number, userId?: string, sessionId?: string) {
        const cartItem = {
            product_id: productId,
            quantity,
            price,
            user_id: userId || null,
            session_id: sessionId || null
        };

        const { data, error } = await this.supabase
            .from('cart_items')
            .insert(cartItem)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getBlogPosts(filters?: {
        featured?: boolean;
        categoryId?: string;
        limit?: number;
        offset?: number;
    }) {
        let query = this.supabase
            .from('blog_posts')
            .select(`
                *,
                profiles:author_id (
                    first_name,
                    last_name,
                    full_name
                ),
                categories:category_id (
                    name,
                    slug
                )
            `)
            .eq('status', 'published');

        if (filters?.featured !== undefined) {
            query = query.eq('is_featured', filters.featured);
        }
        if (filters?.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        if (filters?.offset) {
            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }

        const { data, error } = await query.order('published_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    // File upload methods
    async uploadFile(file: File, bucket: string = 'documents'): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await this.supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    }

    async deleteFile(filePath: string, bucket: string = 'documents'): Promise<void> {
        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) throw error;
    }

    // Observable getters
    getCurrentUser(): Observable<AuthUser | null> {
        return this.currentUser.asObservable();
    }

    getCurrentSession(): Observable<AuthSession | null> {
        return this.currentSession.asObservable();
    }

    // Get current session synchronously
    async getSession(): Promise<AuthSession | null> {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error) throw error;
        return session as AuthSession;
    }

    // Check if user is authenticated
    isAuthenticated(): Observable<boolean> {
        return this.currentUser.pipe(map(user => !!user));
    }
} 