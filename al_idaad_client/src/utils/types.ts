// blog------------------------------
export interface BlogType {
    _id: string;
    title: string;
    thumbnail: string;
    description: string;
    category: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GetAllBlogsResponseType {
    success: boolean;
    count: number;
    data: BlogType[];
}

export interface GetSingleBlogResponseType {
    success: boolean;
    data: BlogType;
}

// blog category ------------------------------

export interface BlogSubCategoryType {
    _id: string;
    name: string;
    subCategories: BlogSubCategoryType[];
}

export interface BlogCategoryType {
    _id: string;
    name: string;
    subCategories: BlogSubCategoryType[];
    createdAt: string;
    updatedAt: string;
}

export interface GetAllBlogCategoriesResponseType {
    success: boolean;
    data: BlogCategoryType[];
}

export interface GetSingleBlogCategoryResponseType {
    success: boolean;
    data: BlogCategoryType;
}

// product category ------------------------------

export interface SubCategoryType {
    _id: string;
    name: string;
    subCategories: SubCategoryType[];
}

export interface CategoryType {
    _id: string;
    name: string;
    subCategories: SubCategoryType[];
    createdAt: string;
    updatedAt: string;
}

export interface GetAllCategoriesResponseType {
    success: boolean;
    data: CategoryType[];
}

export interface GetSingleCategoryResponseType {
    success: boolean;
    data: CategoryType;
}

// banner ------------------------------

export interface BannerType {
    _id: string;
    url?: string;
    desktopUrl?: string;
    mobileUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllBannersResponseType {
    success: boolean;
    count: number;
    data: BannerType[];
}

// product------------------------------------
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

export interface GetAllProductsResponseType {
    success: boolean;
    count: number;
    data: ProductType[];
}

export interface GetSingleProductResponseType {
    success: boolean;
    data: ProductType;
}
// offer banner------------------------------------
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
