"use client";

import { AuthSuccessResponse, AuthUserResponse, ToggleWishlistResponse, UserType } from "@/utils/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
};

type AuthResult = {
  success: boolean;
  message?: string;
};

type ToggleWishlistResult = AuthResult & {
  inWishlist?: boolean;
};

type AuthContextValue = {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthResult>;
  toggleWishlist: (productId: string) => Promise<ToggleWishlistResult>;
  isInWishlist: (productId: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

const getMessageFromResponse = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || "Request failed";
  } catch {
    return "Request failed";
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const refreshAccessToken = useCallback(async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(await getMessageFromResponse(res));
    }

    const data: AuthSuccessResponse = await res.json();
    accessTokenRef.current = data.accessToken;
    return data.accessToken;
  }, []);

  const fetchCurrentUser = useCallback(async (token: string) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(await getMessageFromResponse(res));
    }

    const data: AuthUserResponse = await res.json();
    setUser(data.data);
    return data.data;
  }, []);

  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const requestUrl = path.startsWith("http") ? path : `${API_URL}${path}`;

      const runRequest = async (token?: string) => {
        const headers = new Headers(init.headers);

        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        return fetch(requestUrl, {
          ...init,
          headers,
          credentials: "include",
        });
      };

      let token = accessTokenRef.current;

      if (!token) {
        try {
          token = await refreshAccessToken();
        } catch {
          token = null;
        }
      }

      let response = await runRequest(token || undefined);

      if (response.status === 401) {
        try {
          token = await refreshAccessToken();
          response = await runRequest(token);
        } catch {
          accessTokenRef.current = null;
          setUser(null);
        }
      }

      return response;
    },
    [refreshAccessToken],
  );

  const refreshUser = useCallback(async () => {
    const token = accessTokenRef.current ?? (await refreshAccessToken());
    await fetchCurrentUser(token);
  }, [fetchCurrentUser, refreshAccessToken]);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const token = await refreshAccessToken();

        if (!active) return;

        await fetchCurrentUser(token);
      } catch {
        if (!active) return;
        accessTokenRef.current = null;
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [fetchCurrentUser, refreshAccessToken]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as AuthSuccessResponse & { message?: string };

      if (!res.ok || !data.accessToken) {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }

      accessTokenRef.current = data.accessToken;
      await fetchCurrentUser(data.accessToken);

      return {
        success: true,
        message: data.message || "Logged in successfully",
      };
    },
    [fetchCurrentUser],
  );

  const register = useCallback(
    async ({ name, email, password }: RegisterPayload): Promise<AuthResult> => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Registration failed",
        };
      }

      return login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      accessTokenRef.current = null;
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<AuthResult> => {
      const res = await authFetch("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as AuthUserResponse & { message?: string };

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Profile update failed",
        };
      }

      setUser(data.data);

      return {
        success: true,
        message: data.message || "Profile updated successfully",
      };
    },
    [authFetch],
  );

  const toggleWishlist = useCallback(
    async (productId: string): Promise<ToggleWishlistResult> => {
      const res = await authFetch(`/auth/wishlist/${productId}`, {
        method: "POST",
      });

      const data = (await res.json()) as ToggleWishlistResponse;

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Wishlist update failed",
        };
      }

      setUser(data.data);

      return {
        success: true,
        inWishlist: data.inWishlist,
        message: data.message,
      };
    },
    [authFetch],
  );

  const isInWishlist = useCallback(
    (productId: string) => user?.wishlist?.some((item) => item._id === productId) ?? false,
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      authFetch,
      refreshUser,
      updateProfile,
      toggleWishlist,
      isInWishlist,
    }),
    [user, loading, login, register, logout, authFetch, refreshUser, updateProfile, toggleWishlist, isInWishlist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
