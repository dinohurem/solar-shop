export interface User {
    id: string;
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    role: UserRole;
    status: UserStatus;
    companyId?: string; // Reference to Company if user is a company user
    preferences: UserPreferences;
    addresses: UserAddress[];
    paymentMethods: PaymentMethod[];
    socialLogins: SocialLogin[];
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    metadata?: UserMetadata;
}

export interface UserRole {
    id: string;
    name: string;
    permissions: Permission[];
    isDefault: boolean;
    isActive: boolean;
}

export interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
}

export interface UserStatus {
    isActive: boolean;
    isBlocked: boolean;
    isSuspended: boolean;
    suspensionReason?: string;
    suspensionExpiresAt?: string;
    lastActivity?: string;
}

export interface UserPreferences {
    language: string;
    timezone: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
    marketing: MarketingPreferences;
}

export interface NotificationPreferences {
    email: {
        orderUpdates: boolean;
        promotions: boolean;
        newsletter: boolean;
        security: boolean;
        productUpdates: boolean;
    };
    sms: {
        orderUpdates: boolean;
        security: boolean;
        promotions: boolean;
    };
    push: {
        orderUpdates: boolean;
        promotions: boolean;
        reminders: boolean;
    };
}

export interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowDataCollection: boolean;
    allowPersonalization: boolean;
    allowThirdPartySharing: boolean;
}

export interface MarketingPreferences {
    allowEmailMarketing: boolean;
    allowSmsMarketing: boolean;
    allowPushMarketing: boolean;
    interests: string[];
    preferredContactTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface UserAddress {
    id: string;
    type: 'billing' | 'shipping' | 'both';
    isDefault: boolean;
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    instructions?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'digital_wallet';
    isDefault: boolean;
    nickname?: string;
    cardDetails?: CardDetails;
    paypalDetails?: PaypalDetails;
    bankDetails?: BankDetails;
    walletDetails?: WalletDetails;
    isActive: boolean;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CardDetails {
    lastFourDigits: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    billingAddress: UserAddress;
}

export interface PaypalDetails {
    email: string;
    accountId: string;
}

export interface BankDetails {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountType: 'checking' | 'savings';
}

export interface WalletDetails {
    provider: string;
    walletId: string;
    email?: string;
}

export interface SocialLogin {
    provider: 'google' | 'facebook' | 'twitter' | 'linkedin' | 'apple';
    providerId: string;
    email: string;
    connectedAt: string;
    isActive: boolean;
}

export interface UserMetadata {
    source: string;
    referrer?: string;
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    ipAddress?: string;
    userAgent?: string;
    registrationMethod: 'email' | 'social' | 'phone' | 'invite';
    emailVerificationToken?: string;
    passwordResetToken?: string;
    twoFactorSecret?: string;
    loginAttempts: number;
    lastFailedLogin?: string;
    accountLockUntil?: string;
}

export interface UserSession {
    id: string;
    userId: string;
    token: string;
    refreshToken: string;
    deviceInfo: DeviceInfo;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
    lastUsedAt: string;
}

export interface DeviceInfo {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    deviceId?: string;
    pushToken?: string;
}

export interface UserActivity {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    usersByRole: { [role: string]: number };
    usersByStatus: { [status: string]: number };
    topCountries: { country: string; count: number }[];
    registrationSources: { source: string; count: number }[];
}

export interface UserFilter {
    roles?: string[];
    status?: string[];
    emailVerified?: boolean;
    phoneVerified?: boolean;
    twoFactorEnabled?: boolean;
    registrationDateRange?: {
        start: string;
        end: string;
    };
    lastLoginDateRange?: {
        start: string;
        end: string;
    };
    countries?: string[];
    search?: string;
    sortBy?: 'createdAt' | 'lastLoginAt' | 'firstName' | 'lastName' | 'email';
    sortOrder?: 'asc' | 'desc';
}

export interface UserSearchResult {
    users: User[];
    total: number;
    page: number;
    limit: number;
    filters: UserFilter;
    facets: UserFacets;
}

export interface UserFacets {
    roles: FacetItem[];
    status: FacetItem[];
    countries: FacetItem[];
    registrationSources: FacetItem[];
    verificationStatus: FacetItem[];
}

export interface FacetItem {
    value: string;
    label: string;
    count: number;
    selected: boolean;
} 