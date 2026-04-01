"use client";

import { api, clearAccessToken, setAccessToken } from "@/libs/axios";
import {
    BlogResponseType,
    Category,
    GetBannerResponseType,
    GetCategoryImagesResponseType,
    GetOfferBannerResponseType,
    GetOrdersResponseType,
    GetProductsResponseType,
    Upload,
    User,
} from "@/libs/types";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logoutLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;

    blogCategories: Category[];
    blogCategoriesLoading: boolean;
    changeBlogCategoryKey: () => void;

    blog: BlogResponseType | null;
    blogLoading: boolean;
    changeBlogKey: () => void;

    uploadedFiles: Upload[];
    uploadedFilesLoading: boolean;
    changeUploedFilesKey: () => void;

    productCategories: Category[];
    productCategoriesLoading: boolean;
    changeProductCategoryKey: () => void;

    products: GetProductsResponseType | null;
    productsLoading: boolean;
    changeProductKey: () => void;

    banner: GetBannerResponseType | null;
    bannerLoading: boolean;
    changeBannerKey: () => void;

    offerBanner: GetOfferBannerResponseType | null;
    offerBannerLoading: boolean;
    changeOfferBannerKey: () => void;

    categoryImages: GetCategoryImagesResponseType | null;
    categoryImagesLoading: boolean;
    changeCategoryImagesKey: () => void;

    orders: GetOrdersResponseType | null;
    ordersLoading: boolean;
    changeOrderKey: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // blog category states
    const [blogCategories, setBlogCategories] = useState<Category[]>([]);
    const [blogCategoriesLoading, setBlogCategoriesLoading] = useState(false);
    const [blogCategoryKey, setBlogCategoryKey] = useState(false);

    // blog states
    const [blog, setBlog] = useState<BlogResponseType | null>(null);
    const [blogKey, setBlogKey] = useState(false);
    const [blogLoading, setBlogLoading] = useState(false);

    //upload states
    const [uploadedFiles, setUploadedFiles] = useState<Upload[]>([]);
    const [uploadedFilesKey, setUploadedFilesKey] = useState(false);
    const [uploadedFilesLoading, setUploadedFilesLoading] = useState(false);

    //product category states
    const [productCategories, setProductCategories] = useState<Category[]>([]);
    const [productCategoriesLoading, setProductCategoriesLoading] = useState(false);
    const [productCategoryKey, setProductCategoryKey] = useState(false);

    //product states
    const [products, setProducts] = useState<GetProductsResponseType | null>(null);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsKey, setProductsKey] = useState(false);

    //banner states
    const [banner, setBanner] = useState<GetBannerResponseType | null>(null);
    const [bannerKey, setBannerKey] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false);

    // offer banner states
    const [offerBanner, setOfferBanner] = useState<GetOfferBannerResponseType | null>(null);
    const [offerBannerKey, setOfferBannerKey] = useState(false);
    const [offerBannerLoading, setOfferBannerLoading] = useState(false);

    // category image states
    const [categoryImages, setCategoryImages] = useState<GetCategoryImagesResponseType | null>(null);
    const [categoryImagesKey, setCategoryImagesKey] = useState(false);
    const [categoryImagesLoading, setCategoryImagesLoading] = useState(false);

    // Order states
    const [orders, setOrders] = useState<GetOrdersResponseType | null>(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderKey, setOrderKey] = useState(false);

    const restoreSession = async () => {
        try {
            // Refresh token
            const refreshRes = await api.post<{ accessToken: string }>("/auth/refresh");

            const newToken = refreshRes.data.accessToken;
            setAccessToken(newToken);

            // Load user
            const userRes = await api.get<{ data: User[] }>("/auth/user");

            setUser(userRes.data.data?.[0] || null);
        } catch (error) {
            console.log(error);

            clearAccessToken();
            setUser(null);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    };

    const logout = async () => {
        if (logoutLoading) return;

        try {
            setLogoutLoading(true);
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            clearAccessToken();
            setUser(null);
            setLogoutLoading(false);
            window.location.href = "/";
        }
    };

    useEffect(() => {
        if (!initialized) {
            restoreSession();
        }
    }, [initialized]);

    //==============================================key changing functions=========================

    //Function to update blog category
    const changeBlogCategoryKey = () => {
        setBlogCategoryKey(!blogCategoryKey);
    };
    //Function to update blog
    const changeBlogKey = () => {
        setBlogKey(!blogKey);
    };

    //Function to update images in gallery
    const changeUploedFilesKey = () => {
        setUploadedFilesKey(!uploadedFilesKey);
    };

    //Function to update product category
    const changeProductCategoryKey = () => {
        setProductCategoryKey(!productCategoryKey);
    };

    //Function to update products
    const changeProductKey = () => {
        setProductsKey(!productsKey);
    };

    //Function to update banner
    const changeBannerKey = () => {
        setBannerKey(!bannerKey);
    };

    //Function to update offer banner
    const changeOfferBannerKey = () => {
        setOfferBannerKey(!offerBannerKey);
    };

    //Function to update category images
    const changeCategoryImagesKey = () => {
        setCategoryImagesKey(!categoryImagesKey);
    };

    // Function to update orders
    const changeOrderKey = () => {
        setOrderKey(!orderKey);
    };
    //==============================================fetching data==================================
    // fetch blog-categories
    useEffect(() => {
        setBlogCategoriesLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/blog-categories`)
            .then((res) => {
                setBlogCategories(res.data.data);
                setBlogCategoriesLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setBlogCategoriesLoading(false);
            });
    }, [blogCategoryKey]);

    // fetch blog
    useEffect(() => {
        setBlogLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`)
            .then((res) => {
                setBlog(res.data);
                setBlogLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setBlogLoading(false);
            });
    }, [blogKey]);

    //fetch images
    useEffect(() => {
        setUploadedFilesLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/uploads`)
            .then((res) => {
                setUploadedFiles(res.data.data);
                setUploadedFilesLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setUploadedFilesLoading(false);
            });
    }, [uploadedFilesKey]);

    // fetch product categories
    useEffect(() => {
        setProductCategoriesLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
            .then((res) => {
                setProductCategories(res.data.data);
                setProductCategoriesLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setProductCategoriesLoading(false);
            });
    }, [productCategoryKey]);

    // fetch products
    useEffect(() => {
        setProductsLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            .then((res) => {
                setProducts(res.data);
                setProductsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setProductsLoading(false);
            });
    }, [productsKey]);

    // fetch banner
    useEffect(() => {
        setBannerLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/banners`)
            .then((res) => {
                setBanner(res.data);
                setBannerLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setBannerLoading(false);
            });
    }, [bannerKey]);

    // fetch offer banner
    useEffect(() => {
        setOfferBannerLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/offers`)
            .then((res) => {
                setOfferBanner(res.data);
                setOfferBannerLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setOfferBannerLoading(false);
            });
    }, [offerBannerKey]);

    // fetch category images
    useEffect(() => {
        setCategoryImagesLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/category-images`)
            .then((res) => {
                setCategoryImages(res.data);
                setCategoryImagesLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setCategoryImagesLoading(false);
            });
    }, [categoryImagesKey]);

    // Fetch orders (Note: Using 'api' because orders usually need auth)
    useEffect(() => {
        if (!user) return; // Optional: only fetch if user is logged in

        setOrdersLoading(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            .then((res) => {
                setOrders(res.data);
                setOrdersLoading(false);
            })
            .catch((err) => {
                console.error("Fetch orders error:", err);
                setOrdersLoading(false);
            });
    }, [orderKey, user]);

    const authInfo: AuthContextType = {
        user,
        loading,
        setUser,
        logout,
        logoutLoading,

        blogCategories,
        blogCategoriesLoading,
        changeBlogCategoryKey,

        blog,
        blogLoading,
        changeBlogKey,

        uploadedFiles,
        uploadedFilesLoading,
        changeUploedFilesKey,

        productCategories,
        productCategoriesLoading,
        changeProductCategoryKey,

        products,
        productsLoading,
        changeProductKey,

        banner,
        bannerLoading,
        changeBannerKey,

        offerBanner,
        offerBannerLoading,
        changeOfferBannerKey,

        categoryImages,
        categoryImagesLoading,
        changeCategoryImagesKey,

        orders,
        ordersLoading,
        changeOrderKey,
    };

    return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
