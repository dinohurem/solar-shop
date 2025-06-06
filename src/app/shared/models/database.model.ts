// Database Types for Supabase
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    first_name: string;
                    last_name: string;
                    full_name: string;
                    phone?: string;
                    avatar_url?: string;
                    date_of_birth?: string;
                    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
                    role: 'customer' | 'admin' | 'company_admin';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    first_name: string;
                    last_name: string;
                    full_name?: string;
                    phone?: string;
                    avatar_url?: string;
                    date_of_birth?: string;
                    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
                    role?: 'customer' | 'admin' | 'company_admin';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    first_name?: string;
                    last_name?: string;
                    full_name?: string;
                    phone?: string;
                    avatar_url?: string;
                    date_of_birth?: string;
                    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
                    role?: 'customer' | 'admin' | 'company_admin';
                    updated_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description?: string;
                    image_url?: string;
                    parent_id?: string;
                    is_active: boolean;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string;
                    image_url?: string;
                    parent_id?: string;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string;
                    image_url?: string;
                    parent_id?: string;
                    is_active?: boolean;
                    sort_order?: number;
                    updated_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    short_description: string;
                    price: number;
                    original_price?: number;
                    currency: string;
                    sku: string;
                    brand: string;
                    category_id: string;
                    subcategory?: string;
                    images: ProductImage[];
                    specifications: ProductSpecification[];
                    features: string[];
                    in_stock: boolean;
                    stock_quantity: number;
                    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
                    weight?: number;
                    dimensions?: ProductDimensions;
                    warranty_duration?: number;
                    warranty_unit?: 'months' | 'years';
                    warranty_description?: string;
                    energy_rating?: string;
                    energy_efficiency?: number;
                    power_output?: number;
                    power_unit?: 'W' | 'kW' | 'MW';
                    certifications: string[];
                    installation_required: boolean;
                    free_shipping: boolean;
                    shipping_cost?: number;
                    estimated_delivery_days: number;
                    tags: string[];
                    rating_average: number;
                    rating_count: number;
                    is_active: boolean;
                    is_featured: boolean;
                    is_on_sale: boolean;
                    seo_title?: string;
                    seo_description?: string;
                    seo_keywords: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description: string;
                    short_description: string;
                    price: number;
                    original_price?: number;
                    currency?: string;
                    sku: string;
                    brand: string;
                    category_id: string;
                    subcategory?: string;
                    images?: ProductImage[];
                    specifications?: ProductSpecification[];
                    features?: string[];
                    in_stock?: boolean;
                    stock_quantity?: number;
                    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
                    weight?: number;
                    dimensions?: ProductDimensions;
                    warranty_duration?: number;
                    warranty_unit?: 'months' | 'years';
                    warranty_description?: string;
                    energy_rating?: string;
                    energy_efficiency?: number;
                    power_output?: number;
                    power_unit?: 'W' | 'kW' | 'MW';
                    certifications?: string[];
                    installation_required?: boolean;
                    free_shipping?: boolean;
                    shipping_cost?: number;
                    estimated_delivery_days?: number;
                    tags?: string[];
                    rating_average?: number;
                    rating_count?: number;
                    is_active?: boolean;
                    is_featured?: boolean;
                    is_on_sale?: boolean;
                    seo_title?: string;
                    seo_description?: string;
                    seo_keywords?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    short_description?: string;
                    price?: number;
                    original_price?: number;
                    currency?: string;
                    sku?: string;
                    brand?: string;
                    category_id?: string;
                    subcategory?: string;
                    images?: ProductImage[];
                    specifications?: ProductSpecification[];
                    features?: string[];
                    in_stock?: boolean;
                    stock_quantity?: number;
                    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
                    weight?: number;
                    dimensions?: ProductDimensions;
                    warranty_duration?: number;
                    warranty_unit?: 'months' | 'years';
                    warranty_description?: string;
                    energy_rating?: string;
                    energy_efficiency?: number;
                    power_output?: number;
                    power_unit?: 'W' | 'kW' | 'MW';
                    certifications?: string[];
                    installation_required?: boolean;
                    free_shipping?: boolean;
                    shipping_cost?: number;
                    estimated_delivery_days?: number;
                    tags?: string[];
                    rating_average?: number;
                    rating_count?: number;
                    is_active?: boolean;
                    is_featured?: boolean;
                    is_on_sale?: boolean;
                    seo_title?: string;
                    seo_description?: string;
                    seo_keywords?: string[];
                    updated_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    order_number: string;
                    customer_email: string;
                    customer_name?: string;
                    customer_phone?: string;
                    total_amount: number;
                    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
                    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
                    shipping_status?: 'not_shipped' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
                    payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
                    order_date: string;
                    shipping_address?: string;
                    billing_address?: string;
                    tracking_number?: string;
                    shipping_cost?: number;
                    notes?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    order_number: string;
                    customer_email: string;
                    customer_name?: string;
                    customer_phone?: string;
                    total_amount: number;
                    status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
                    shipping_status?: 'not_shipped' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
                    payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
                    order_date: string;
                    shipping_address?: string;
                    billing_address?: string;
                    tracking_number?: string;
                    shipping_cost?: number;
                    notes?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    order_number?: string;
                    customer_email?: string;
                    customer_name?: string;
                    customer_phone?: string;
                    total_amount?: number;
                    status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
                    shipping_status?: 'not_shipped' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
                    payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
                    order_date?: string;
                    shipping_address?: string;
                    billing_address?: string;
                    tracking_number?: string;
                    shipping_cost?: number;
                    notes?: string;
                    updated_at?: string;
                };
            };
            offers: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    short_description: string;
                    type: OfferType;
                    status: OfferStatus;
                    priority: number;
                    featured: boolean;
                    image_url?: string;
                    banner_image_url?: string;
                    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
                    discount_value: number;
                    max_discount_amount?: number;
                    currency?: string;
                    coupon_code?: string;
                    auto_apply: boolean;
                    min_order_amount?: number;
                    max_order_amount?: number;
                    applicable_product_ids?: string[];
                    applicable_category_ids?: string[];
                    excluded_product_ids?: string[];
                    excluded_category_ids?: string[];
                    max_total_usage?: number;
                    max_usage_per_customer?: number;
                    current_usage: number;
                    start_date: string;
                    end_date?: string;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    short_description: string;
                    type: OfferType;
                    status?: OfferStatus;
                    priority?: number;
                    featured?: boolean;
                    image_url?: string;
                    banner_image_url?: string;
                    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
                    discount_value: number;
                    max_discount_amount?: number;
                    currency?: string;
                    coupon_code?: string;
                    auto_apply?: boolean;
                    min_order_amount?: number;
                    max_order_amount?: number;
                    applicable_product_ids?: string[];
                    applicable_category_ids?: string[];
                    excluded_product_ids?: string[];
                    excluded_category_ids?: string[];
                    max_total_usage?: number;
                    max_usage_per_customer?: number;
                    current_usage?: number;
                    start_date: string;
                    end_date?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    short_description?: string;
                    type?: OfferType;
                    status?: OfferStatus;
                    priority?: number;
                    featured?: boolean;
                    image_url?: string;
                    banner_image_url?: string;
                    discount_type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
                    discount_value?: number;
                    max_discount_amount?: number;
                    currency?: string;
                    coupon_code?: string;
                    auto_apply?: boolean;
                    min_order_amount?: number;
                    max_order_amount?: number;
                    applicable_product_ids?: string[];
                    applicable_category_ids?: string[];
                    excluded_product_ids?: string[];
                    excluded_category_ids?: string[];
                    max_total_usage?: number;
                    max_usage_per_customer?: number;
                    current_usage?: number;
                    start_date?: string;
                    end_date?: string;
                    is_active?: boolean;
                    updated_at?: string;
                };
            };
            cart_items: {
                Row: {
                    id: string;
                    user_id?: string;
                    session_id?: string;
                    product_id: string;
                    quantity: number;
                    price: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    session_id?: string;
                    product_id: string;
                    quantity: number;
                    price: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    session_id?: string;
                    product_id?: string;
                    quantity?: number;
                    price?: number;
                    updated_at?: string;
                };
            };
            blog_posts: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    content: string;
                    excerpt: string;
                    featured_image_url?: string;
                    author_id: string;
                    category_id?: string;
                    tags: string[];
                    status: 'draft' | 'published' | 'archived';
                    published_at?: string;
                    seo_title?: string;
                    seo_description?: string;
                    seo_keywords: string[];
                    reading_time?: number;
                    view_count: number;
                    is_featured: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    content: string;
                    excerpt: string;
                    featured_image_url?: string;
                    author_id: string;
                    category_id?: string;
                    tags?: string[];
                    status?: 'draft' | 'published' | 'archived';
                    published_at?: string;
                    seo_title?: string;
                    seo_description?: string;
                    seo_keywords?: string[];
                    reading_time?: number;
                    view_count?: number;
                    is_featured?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    content?: string;
                    excerpt?: string;
                    featured_image_url?: string;
                    author_id?: string;
                    category_id?: string;
                    tags?: string[];
                    status?: 'draft' | 'published' | 'archived';
                    published_at?: string;
                    seo_title?: string;
                    seo_description?: string;
                    seo_keywords?: string[];
                    reading_time?: number;
                    view_count?: number;
                    is_featured?: boolean;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

// Supporting interfaces
export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    is_primary: boolean;
    order: number;
    type: 'main' | 'gallery' | 'thumbnail' | 'technical';
}

export interface ProductSpecification {
    name: string;
    value: string;
    unit?: string;
    category: string;
    order: number;
}

export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'mm' | 'm' | 'in' | 'ft';
}

export type OfferType =
    | 'percentage_discount'
    | 'fixed_amount_discount'
    | 'buy_x_get_y'
    | 'free_shipping'
    | 'bundle_deal'
    | 'flash_sale'
    | 'seasonal_sale'
    | 'clearance'
    | 'loyalty_reward'
    | 'referral_bonus'
    | 'first_time_customer'
    | 'bulk_discount';

export type OfferStatus =
    | 'draft'
    | 'scheduled'
    | 'active'
    | 'paused'
    | 'expired'
    | 'cancelled'; 