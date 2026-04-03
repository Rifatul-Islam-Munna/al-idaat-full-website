export interface LoginResponse {
    success: boolean;
    accessToken: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    verified?: boolean;
}
// category---------------------------------
export interface Category {
    _id: string;
    name: string;
    subCategories: Category[];
}

// blog----------------------------------------
export interface BlogCategoryType {
    _id: string;
    name: string;
}

export interface BlogType {
    _id: string;
    title: string;
    thumbnail: string;
    description: string; // HTML string
    category: BlogCategoryType;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
    __v: number;
}

export interface BlogResponseType {
    success: boolean;
    count: number;
    data: BlogType[];
}

export interface SingleBlogResponseType {
    success: boolean;
    data: BlogType;
}

// upload----------------------------------------
export interface Upload {
    _id: string;
    originalName: string;
    url: string;
    publicId: string;
}
// product----------------------------------------
export interface ProductVariant {
    size: string;
    color?: string;
    chest?: number;
    length?: number;
    price?: number;
}

export interface AttarSize {
    ml: number;
    price: number;
}

export interface ProductType {
    _id: string;
    name: string;
    shortDescription?: string;
    description: string;
    brand?: string;
    category: {
        _id: string;
        name: string;
    };
    categoryIdList: {
        _id: string;
        name: string;
    }[];
    categoryIdListFilter: string[];
    price: number;
    priceRange: { min: number; max: number };
    discountPercentage?: number;

    inStock: boolean;

    isFeatured?: boolean;
    isBestSelling?: boolean;

    // For thobe
    variants?: ProductVariant[];

    // For attar
    attarSizes?: AttarSize[];

    thumbnail: string;
    images: string[];
    ratings: number;
    reviews?: string[];

    deliveryCharge: {
        regular: {
            charge: number;
            city: "all";
        };
        special: {
            charge: number;
            city: string;
        };
    };

    createdAt: string;
    updatedAt: string;
}

export interface GetProductsResponseType {
    success: boolean;
    count: number;
    data: ProductType[];
}
// customer reviews----------------------------------------
export interface CustomerReviewType {
    _id: string;
    name: string;
    location?: string;
    review: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetCustomerReviewsResponseType {
    success: boolean;
    count: number;
    data: CustomerReviewType[];
}
//banner----------------------------------------
export interface BannerType {
    _id: string;
    url?: string;
    desktopUrl?: string;
    mobileUrl?: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}
export interface GetBannerResponseType {
    success: boolean;
    count: number;
    data: BannerType[];
}
// offer banner-----------------------------------
export type OfferType = {
    _id: string;
    url?: string;
    desktopUrl?: string;
    mobileUrl?: string;
    productId: string;
    createdAt: string;
    updatedAt: string;
};

export type GetOfferBannerResponseType = {
    success: boolean;
    count: number;
    data: OfferType[];
};
// category image-----------------------------------
export interface CategoryImageType {
    _id: string;
    url: string;
    categoryId: string;
    categoryName: string;
    categoryParentName: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetCategoryImagesResponseType {
    success: boolean;
    count: number;
    data: CategoryImageType[];
}
// order----------------------------------------
export interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    thumbnail: string;
    attarSize?: {
        ml: number;
        price: number;
        _id: string;
    };
    variant?: {
        size: string;
        color: string;
        chest: number;
        length: number;
        _id: string;
    };
}

export interface OrderType {
    _id: string;
    fullName: string;
    phone: string;
    altPhone?: string;
    address: string;
    city: string;
    district: string;
    note?: string;
    items: OrderItem[];
    subtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    paymentMethod: string;
    steadfastTrackingCode?: string;
    steadfastConsignmentId?: string;
    deliveryStatus: "pending" | "processing" | "delivered" | "cancelled" | string;
    createdAt: string;
    updatedAt: string;
}

// Response Types
export interface GetOrdersResponseType {
    success: boolean;
    count: number;
    data: OrderType[];
}

export interface SingleOrderResponseType {
    success: boolean;
    data: OrderType;
}

export interface CreateOrderResponseType {
    success: boolean;
    data: {
        orderId: string;
        tracking_code: string | null;
        consignment_id: string | null;
        deliveryStatus: string;
        steadfastSuccess: boolean;
    };
}
