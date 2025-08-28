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

            // Profile creation is handled by database triggers
            // No need to manually create profile here

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

    async resendConfirmationEmail(email: string): Promise<{ error?: string }> {
        try {
            const { error } = await this.supabase.auth.resend({
                type: 'signup',
                email: email
            });
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

    async createUserProfile(profileData: Database['public']['Tables']['profiles']['Insert']): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating user profile:', error);
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
        console.log(`Updating ${tableName} record with id: ${id}`, record);

        const { data, error } = await this.supabase
            .from(tableName)
            .update(record)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating ${tableName} record:`, error);
            console.error(`Update attempted on ID: ${id} with data:`, record);
            throw new Error(`Failed to update ${tableName}: ${error.message} (Code: ${error.code})`);
        }

        if (!data) {
            console.error(`No data returned after updating ${tableName} with ID: ${id}`);
            throw new Error(`Update operation completed but no data was returned for ${tableName} with ID: ${id}`);
        }

        console.log(`Successfully updated ${tableName} record:`, data);
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

    // Admin-specific delete method that provides more detailed error logging
    async adminDeleteRecord<T extends keyof Database['public']['Tables']>(
        tableName: T,
        id: string
    ): Promise<void> {
        console.log(`Admin attempting to delete ${tableName} record with id: ${id}`);

        // First check if the record exists
        const { data: existingRecord, error: fetchError } = await this.supabase
            .from(tableName)
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`Error fetching ${tableName} record for deletion:`, fetchError);
            throw new Error(`Failed to find ${tableName} record: ${fetchError.message}`);
        }

        if (!existingRecord) {
            console.error(`Record not found: ${tableName} with id ${id}`);
            throw new Error(`Record not found: ${tableName} with id ${id}`);
        }

        console.log(`Record found, proceeding with deletion...`);

        // Attempt the deletion
        const { error } = await this.supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting ${tableName} record:`, error);
            throw new Error(`Failed to delete ${tableName}: ${error.message} (Code: ${error.code})`);
        }

        console.log(`Successfully deleted ${tableName} record with id: ${id}`);
    }

    // Admin-specific update method that provides more detailed error logging
    async adminUpdateRecord<T extends keyof Database['public']['Tables']>(
        tableName: T,
        id: string,
        record: Database['public']['Tables'][T]['Update']
    ): Promise<Database['public']['Tables'][T]['Row'] | null> {
        console.log(`Admin attempting to update ${tableName} record with id: ${id}`, record);

        // First check if the record exists
        const { data: existingRecord, error: fetchError } = await this.supabase
            .from(tableName)
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`Error fetching ${tableName} record for update:`, fetchError);
            throw new Error(`Failed to find ${tableName} record: ${fetchError.message}`);
        }

        if (!existingRecord) {
            console.error(`Record not found: ${tableName} with id ${id}`);
            throw new Error(`Record not found: ${tableName} with id ${id}`);
        }

        console.log(`Record found, proceeding with update...`);

        // Attempt the update
        const { data, error } = await this.supabase
            .from(tableName)
            .update(record)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating ${tableName} record:`, error);
            throw new Error(`Failed to update ${tableName}: ${error.message} (Code: ${error.code})`);
        }

        if (!data) {
            console.error(`No data returned after updating ${tableName} with ID: ${id}`);
            throw new Error(`Update operation completed but no data was returned for ${tableName} with ID: ${id}`);
        }

        console.log(`Successfully updated ${tableName} record:`, data);
        return data as Database['public']['Tables'][T]['Row'];
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
                ),
                product_categories!product_categories_product_id_fkey (
                    is_primary,
                    categories!product_categories_category_id_fkey (
                        id,
                        name,
                        slug
                    )
                )
            `)
            .eq('is_active', true);

        if (filters?.categoryId) {
            // Support both legacy category_id and product_categories filtering
            query = query.or(`category_id.eq.${filters.categoryId},product_categories.category_id.eq.${filters.categoryId}`);
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
            .eq('status', 'active')
            .lte('start_date', new Date().toISOString())
            .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
            .order('priority', { ascending: true });

        if (error) throw error;
        return data;
    }

    async getB2BOffers(filters?: {
        featured?: boolean;
        limit?: number;
        offset?: number;
    }) {
        let query = this.supabase
            .from('offers')
            .select('*')
            .eq('is_b2b', true)
            .eq('status', 'active');

        if (filters?.featured !== undefined) {
            query = query.eq('featured', filters.featured);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }

        // Order by featured first, then by priority
        const { data, error } = await query.order('featured', { ascending: false })
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
        // First, get the blog posts without joins
        let query = this.supabase
            .from('blog_posts')
            .select('*')
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

        const { data: posts, error } = await query.order('published_at', { ascending: false });

        if (error) {
            console.error('Error fetching blog posts:', error);
            throw error;
        }

        if (!posts || posts.length === 0) {
            return [];
        }

        // Now get author and category information separately
        const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))];
        const categoryIds = [...new Set(posts.map(post => post.category_id).filter(Boolean))];

        // Get profiles data
        let profiles: any[] = [];
        if (authorIds.length > 0) {
            const { data: profilesData, error: profilesError } = await this.supabase
                .from('profiles')
                .select('id, first_name, last_name, full_name, avatar_url')
                .in('id', authorIds);

            if (!profilesError) {
                profiles = profilesData || [];
            }
        }

        // Get categories data
        let categories: any[] = [];
        if (categoryIds.length > 0) {
            const { data: categoriesData, error: categoriesError } = await this.supabase
                .from('categories')
                .select('id, name, slug')
                .in('id', categoryIds);

            if (!categoriesError) {
                categories = categoriesData || [];
            }
        }

        // Map the data together
        const postsWithRelations = posts.map(post => ({
            ...post,
            profiles: profiles.find(profile => profile.id === post.author_id) || null,
            categories: categories.find(category => category.id === post.category_id) || null
        }));

        return postsWithRelations;
    }

    async getBlogPostById(id: string) {
        // Get the blog post
        const { data: post, error } = await this.supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .eq('status', 'published')
            .single();

        if (error) throw error;
        if (!post) return null;

        // Get author data
        let profiles = null;
        if (post.author_id) {
            const { data: profileData, error: profileError } = await this.supabase
                .from('profiles')
                .select('id, first_name, last_name, full_name, avatar_url')
                .eq('id', post.author_id)
                .single();

            if (!profileError && profileData) {
                profiles = profileData;
            }
        }

        // Get category data
        let categories = null;
        if (post.category_id) {
            const { data: categoryData, error: categoryError } = await this.supabase
                .from('categories')
                .select('id, name, slug')
                .eq('id', post.category_id)
                .single();

            if (!categoryError && categoryData) {
                categories = categoryData;
            }
        }

        return {
            ...post,
            profiles,
            categories
        };
    }

    async getBlogPostBySlug(slug: string) {
        // Get the blog post
        const { data: post, error } = await this.supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) throw error;
        if (!post) return null;

        // Get author data
        let profiles = null;
        if (post.author_id) {
            const { data: profileData, error: profileError } = await this.supabase
                .from('profiles')
                .select('id, first_name, last_name, full_name, avatar_url')
                .eq('id', post.author_id)
                .single();

            if (!profileError && profileData) {
                profiles = profileData;
            }
        }

        // Get category data
        let categories = null;
        if (post.category_id) {
            const { data: categoryData, error: categoryError } = await this.supabase
                .from('categories')
                .select('id, name, slug')
                .eq('id', post.category_id)
                .single();

            if (!categoryError && categoryData) {
                categories = categoryData;
            }
        }

        return {
            ...post,
            profiles,
            categories
        };
    }

    async getRelatedBlogPosts(categoryId?: string, excludeId?: string, limit: number = 3) {
        // Get related blog posts
        let query = this.supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .limit(limit);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data: posts, error } = await query.order('published_at', { ascending: false });
        if (error) throw error;

        if (!posts || posts.length === 0) {
            return [];
        }

        // Get author and category information separately
        const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))];
        const categoryIds = [...new Set(posts.map(post => post.category_id).filter(Boolean))];

        // Get profiles data
        let profiles: any[] = [];
        if (authorIds.length > 0) {
            const { data: profilesData, error: profilesError } = await this.supabase
                .from('profiles')
                .select('id, first_name, last_name, full_name, avatar_url')
                .in('id', authorIds);

            if (!profilesError) {
                profiles = profilesData || [];
            }
        }

        // Get categories data
        let categories: any[] = [];
        if (categoryIds.length > 0) {
            const { data: categoriesData, error: categoriesError } = await this.supabase
                .from('categories')
                .select('id, name, slug')
                .in('id', categoryIds);

            if (!categoriesError) {
                categories = categoriesData || [];
            }
        }

        // Map the data together
        const postsWithRelations = posts.map(post => ({
            ...post,
            profiles: profiles.find(profile => profile.id === post.author_id) || null,
            categories: categories.find(category => category.id === post.category_id) || null
        }));

        return postsWithRelations;
    }

    async incrementBlogPostViews(id: string) {
        const { error } = await this.supabase.rpc('increment_blog_post_views', { post_id: id });
        if (error) throw error;
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

    // Getter for direct client access (for special operations)
    get client(): SupabaseClient<Database> {
        return this.supabase;
    }

    // Method to find user by email using database function
    async findAuthUserByEmail(email: string): Promise<{ id: string; email: string; profile?: any } | null> {
        try {
            const { data, error } = await this.supabase
                .rpc('find_user_by_email', { user_email: email });

            if (error) {
                console.error('Error calling find_user_by_email function:', error);
                return null;
            }

            if (data && data.length > 0) {
                const user = data[0];
                return {
                    id: user.user_id,
                    email: user.email,
                    profile: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        full_name: user.full_name,
                        role: user.role
                    }
                };
            }

            return null;
        } catch (error) {
            console.error('Error finding auth user by email:', error);
            return null;
        }
    }

    // Stock Management Methods
    async decrementProductStock(productId: string, quantity: number): Promise<boolean> {
        try {
            console.log(`Decrementing stock for product ${productId} by ${quantity}`);

            // First check current stock
            const product = await this.getTableById('products', productId);
            if (!product) {
                console.error(`Product ${productId} not found`);
                return false;
            }

            const currentStock = product.stock_quantity;
            if (currentStock < quantity) {
                console.error(`Insufficient stock for product ${productId}. Available: ${currentStock}, Requested: ${quantity}`);
                return false;
            }

            const newStock = currentStock - quantity;

            // Update stock quantity
            const { data, error } = await this.supabase
                .from('products')
                .update({
                    stock_quantity: newStock,
                    stock_status: this.calculateStockStatus(newStock, (product as any).stock_threshold || 5),
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId)
                .select()
                .single();

            if (error) {
                console.error('Error updating product stock:', error);
                return false;
            }

            console.log(`Stock updated successfully for product ${productId}: ${currentStock} -> ${newStock}`);
            return true;
        } catch (error) {
            console.error('Error in decrementProductStock:', error);
            return false;
        }
    }

    async incrementProductStock(productId: string, quantity: number): Promise<boolean> {
        try {
            console.log(`Incrementing stock for product ${productId} by ${quantity}`);

            // Get current product
            const product = await this.getTableById('products', productId);
            if (!product) {
                console.error(`Product ${productId} not found`);
                return false;
            }

            const currentStock = product.stock_quantity;
            const newStock = currentStock + quantity;

            // Update stock quantity
            const { data, error } = await this.supabase
                .from('products')
                .update({
                    stock_quantity: newStock,
                    stock_status: this.calculateStockStatus(newStock, (product as any).stock_threshold || 5),
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId)
                .select()
                .single();

            if (error) {
                console.error('Error updating product stock:', error);
                return false;
            }

            console.log(`Stock updated successfully for product ${productId}: ${currentStock} -> ${newStock}`);
            return true;
        } catch (error) {
            console.error('Error in incrementProductStock:', error);
            return false;
        }
    }

    async processOrderStockAdjustment(orderItems: any[], decrement: boolean = true): Promise<boolean> {
        try {
            console.log(`Processing stock adjustment for ${orderItems.length} items (decrement: ${decrement})`);

            const stockAdjustments: { productId: string; quantity: number; success: boolean }[] = [];

            for (const item of orderItems) {
                if (!item.product_id && !item.productId) {
                    console.log(`Skipping stock adjustment for item without product_id: ${item.product_name || item.name}`);
                    continue;
                }

                const productId = item.product_id || item.productId;
                const quantity = item.quantity;

                const success = decrement
                    ? await this.decrementProductStock(productId, quantity)
                    : await this.incrementProductStock(productId, quantity);

                stockAdjustments.push({
                    productId: productId,
                    quantity: quantity,
                    success
                });

                if (!success && decrement) {
                    // If any stock decrement fails, we need to rollback
                    console.error(`Stock adjustment failed for product ${productId}`);

                    // Rollback previous adjustments
                    for (const adjustment of stockAdjustments) {
                        if (adjustment.success && adjustment.productId !== productId) {
                            await this.incrementProductStock(adjustment.productId, adjustment.quantity);
                        }
                    }
                    return false;
                }
            }

            console.log('Stock adjustments completed successfully');
            return true;
        } catch (error) {
            console.error('Error in processOrderStockAdjustment:', error);
            return false;
        }
    }

    private calculateStockStatus(quantity: number, threshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
        if (quantity === 0) {
            return 'out_of_stock';
        } else if (quantity <= threshold) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }
} 