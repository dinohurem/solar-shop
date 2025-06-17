export interface WishlistItem {
    id: string;
    userId: string;
    productId: string;
    createdAt: string;
    updatedAt: string;

    // Product details (when populated)
    product?: {
        id: string;
        name: string;
        slug: string;
        description: string;
        price: number;
        originalPrice?: number;
        currency: string;
        sku: string;
        brand: string;
        categoryId?: string;
        categoryName?: string;
        images: ProductImage[];
        isActive: boolean;
        isFeatured: boolean;
        stockQuantity: number;
        availability: 'available' | 'limited' | 'out-of-stock';
        rating?: number;
        reviewCount?: number;
    };
}

interface ProductImage {
    url: string;
    alt: string;
    is_primary: boolean;
    order: number;
    type: 'main' | 'gallery';
}

export interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
    error: string | null;
    addingToWishlist: boolean;
    removingFromWishlist: string | null; // productId being removed
} 