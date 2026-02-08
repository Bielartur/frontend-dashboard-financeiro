import axios, { type AxiosRequestConfig, type Method, AxiosError } from "axios";
import type { ApiError } from "../models/Api";

export const BASE_URL = "http://localhost:8000";

// In-memory access token storage
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

// Create Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for Cookies (Refresh Token)
});

// Request Interceptor: Inject Access Token
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response Interceptor: Handle 401 & Refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token using the HttpOnly cookie
                const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                const newAccessToken = refreshResponse.data.access_token;

                if (newAccessToken) {
                    setAccessToken(newAccessToken);

                    // Update header and retry original request
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed (cookie expired or invalid)
                setAccessToken(null);
                // Optionally redirect to login here if we had access to router
                // window.location.href = "/login"; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function normalizeAxiosError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        return {
            success: false,
            message: data?.detail || data?.message || (error as Error).message || "Erro de comunicação com o servidor",
            code: data?.code,
            details: data
        };
    }

    return {
        success: false,
        message: "Erro inesperado",
    };
}

export async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    data: Record<string, unknown> | FormData = {},
    withAuth: boolean = true
): Promise<T> {
    const config: AxiosRequestConfig = {
        url: endpoint,
        method,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined,
    };

    if (!(data instanceof FormData)) {
        // Axios sets Content-Type automatically for objects, but we can enforce if needed.
        // For FormData it sets multipart automatically.
    }

    try {
        const response = await api(config);
        return response.data;
    } catch (err) {
        throw normalizeAxiosError(err);
    }
}
