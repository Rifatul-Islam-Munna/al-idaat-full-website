import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/* ======================
   MEMORY TOKEN STORE
====================== */

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
    accessToken = token;
};

export const clearAccessToken = () => {
    accessToken = null;
};

export const getAccessToken = () => {
    return accessToken;
};

/* ======================
   QUEUE SYSTEM
====================== */

interface FailedRequest {
    resolve: (value?: unknown) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

/* ======================
   AXIOS INSTANCE
====================== */

export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

/* ======================
   REQUEST INTERCEPTOR
====================== */

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const url = config.url || "";

    if (accessToken && config.headers && !url.includes("/auth/login") && !url.includes("/auth/refresh")) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

/* ======================
   RESPONSE INTERCEPTOR
====================== */

interface RetryConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const url = originalRequest?.url || "";

        const skipRefresh = url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/user");

        if (status === 401 && !originalRequest._retry && !skipRefresh) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post<{ accessToken: string }>(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

                const newToken = res.data.accessToken;

                setAccessToken(newToken);

                processQueue(null);

                return api(originalRequest);
            } catch (err) {
                processQueue(err);
                clearAccessToken();

                if (typeof window !== "undefined" && window.location.pathname !== "/") {
                    window.location.href = "/";
                }

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);
