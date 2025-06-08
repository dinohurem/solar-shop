export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    parentId?: string;
    level: number;
    path: string;
    image?: string;
    icon?: string;
    bannerImage?: string;
    thumbnailImage?: string;
    color?: string;
    backgroundColor?: string;
    isActive: boolean;
    isVisible: boolean;
    isFeatured: boolean;
    order: number;
    productCount: number;
    activeProductCount: number;
    children: Category[];
    parent?: Category;
    ancestors: CategoryAncestor[];
    attributes: CategoryAttribute[];
    filters: CategoryFilter[];
    seoMetadata?: SeoMetadata;
    customFields?: { [key: string]: any };
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface CategoryAncestor {
    id: string;
    name: string;
    slug: string;
    level: number;
}

export interface CategoryAttribute {
    id: string;
    name: string;
    type: AttributeType;
    required: boolean;
    filterable: boolean;
    searchable: boolean;
    comparable: boolean;
    options?: AttributeOption[];
    validation?: AttributeValidation;
    order: number;
    isActive: boolean;
}

export type AttributeType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'decimal'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'select'
    | 'multiselect'
    | 'color'
    | 'image'
    | 'file'
    | 'url'
    | 'email';

export interface AttributeOption {
    id: string;
    value: string;
    label: string;
    color?: string;
    image?: string;
    order: number;
    isActive: boolean;
}

export interface AttributeValidation {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    required?: boolean;
    unique?: boolean;
}

export interface CategoryFilter {
    id: string;
    name: string;
    type: FilterType;
    attributeId?: string;
    options: FilterOption[];
    isActive: boolean;
    order: number;
    displayType: FilterDisplayType;
    allowMultiple: boolean;
    showCount: boolean;
}

export type FilterType =
    | 'attribute'
    | 'price'
    | 'brand'
    | 'rating'
    | 'availability'
    | 'discount'
    | 'custom';

export type FilterDisplayType =
    | 'checkbox'
    | 'radio'
    | 'dropdown'
    | 'range_slider'
    | 'color_swatch'
    | 'size_chart'
    | 'toggle';

export interface FilterOption {
    id: string;
    value: string;
    label: string;
    count: number;
    color?: string;
    image?: string;
    order: number;
    isActive: boolean;
}

export interface SeoMetadata {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    structuredData?: any;
}

export interface CategoryTree {
    id: string;
    name: string;
    slug: string;
    level: number;
    productCount: number;
    isActive: boolean;
    children: CategoryTree[];
}

export interface CategoryBreadcrumb {
    id: string;
    name: string;
    slug: string;
    url: string;
    level: number;
}

export interface CategoryNavigation {
    id: string;
    name: string;
    slug: string;
    url: string;
    image?: string;
    icon?: string;
    children: CategoryNavigation[];
    isActive: boolean;
    isFeatured: boolean;
    order: number;
}

export interface CategoryStats {
    totalCategories: number;
    activeCategories: number;
    featuredCategories: number;
    categoriesWithProducts: number;
    averageProductsPerCategory: number;
    topCategories: CategoryPerformance[];
    recentCategories: Category[];
    categoriesByLevel: { [level: number]: number };
    categoryGrowth: CategoryGrowthData[];
}

export interface CategoryPerformance {
    categoryId: string;
    categoryName: string;
    productCount: number;
    views: number;
    sales: number;
    revenue: number;
    conversionRate: number;
}

export interface CategoryGrowthData {
    month: string;
    categoriesCreated: number;
    productsAdded: number;
    totalViews: number;
    totalSales: number;
}

export interface CategorySearchFilter {
    parentId?: string;
    level?: number;
    isActive?: boolean;
    isVisible?: boolean;
    isFeatured?: boolean;
    hasProducts?: boolean;
    search?: string;
    sortBy?: 'name' | 'order' | 'productCount' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export interface CategorySearchResult {
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    filters: CategorySearchFilter;
    facets: CategoryFacets;
}

export interface CategoryFacets {
    levels: FacetItem[];
    parentCategories: FacetItem[];
    productCounts: FacetItem[];
    status: FacetItem[];
}

export interface FacetItem {
    value: string;
    label: string;
    count: number;
    selected: boolean;
}

export interface CategoryTemplate {
    id: string;
    name: string;
    description: string;
    type: string;
    attributes: CategoryAttribute[];
    filters: CategoryFilter[];
    seoTemplate: SeoTemplate;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SeoTemplate {
    titleTemplate: string;
    descriptionTemplate: string;
    keywordsTemplate: string[];
    variables: string[];
}



export interface CategoryAnalytics {
    categoryId: string;
    views: CategoryViewAnalytics;
    products: CategoryProductAnalytics;
    sales: CategorySalesAnalytics;
    search: CategorySearchAnalytics;
    filters: CategoryFilterAnalytics;
}

export interface CategoryViewAnalytics {
    totalViews: number;
    uniqueViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
    dailyViews: { [date: string]: number };
    topReferrers: { source: string; views: number }[];
    deviceBreakdown: { device: string; views: number }[];
}

export interface CategoryProductAnalytics {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    topProducts: { productId: string; name: string; views: number; sales: number }[];
}

export interface CategorySalesAnalytics {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    dailySales: { [date: string]: { sales: number; revenue: number } };
    topCustomers: { customerId: string; name: string; orders: number; revenue: number }[];
}

export interface CategorySearchAnalytics {
    searchQueries: { query: string; count: number; results: number }[];
    noResultsQueries: { query: string; count: number }[];
    popularFilters: { filter: string; usage: number }[];
    filterCombinations: { filters: string[]; usage: number }[];
}

export interface CategoryFilterAnalytics {
    filterUsage: { filterId: string; name: string; usage: number }[];
    filterCombinations: { filters: string[]; usage: number }[];
    abandonmentRate: number;
    conversionByFilter: { filterId: string; conversionRate: number }[];
} 