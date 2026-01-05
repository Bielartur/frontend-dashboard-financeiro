import axios, { type AxiosRequestConfig, type Method } from "axios";
import type { ApiError } from "../models/Api";

// Hardcoded token for now as requested by user in previous context, 
// or we can use the helper if the user wants to keep the token management structure.
// The user said: "adapte esse arquivo ... sem utilizar o refreshToken".
// We will grab the token from localStorage if available, or just use the hardcoded one if we decide to keep it there.
// For now, let's assume we want to support the previous hardcoded token or a token passed in.

const BASE_URL = "http://localhost:8000";

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

// Simple token storage for now (can be replaced by HelpersToken if we keep it)
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnYWJyaWVsY2FudG8yMDE2QGdtYWlsLmNvbSIsImlkIjoiZWM5NjE2ZDktNWM4NC00NjE3LTg4MmQtY2QzMDVjNTFjMzcwIiwiZXhwIjoxNzcwMDYzNjUzfQ.qsWmgQD7ZrLfYmonOoJ1pUKXjnJPWEGCI4luLcJB_Mo";

export async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    data: Record<string, unknown> = {},
    withAuth: boolean = true
): Promise<T> {
    const headers: AxiosRequestConfig["headers"] = {
        "Content-Type": "application/json",
    };

    if (withAuth) {
        // Use the hardcoded token as primary for now since the auth flow isn't fully set up with login
        headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }

    const config: AxiosRequestConfig = {
        baseURL: BASE_URL,
        url: endpoint,
        method,
        headers,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined,
    };

    try {
        const response = await axios<T>(config);
        return response.data;
    } catch (err) {
        throw normalizeAxiosError(err);
    }
}
