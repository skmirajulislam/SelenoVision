/**
 * Application constants and configuration
 */

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5002',
} as const;

export const STORAGE_KEYS = {
    TOKEN: 'token',
    GEMINI_API_KEY: 'gemini_api_key',
} as const;
