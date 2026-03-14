const PRODUCTION_FRONTEND_URL = 'https://livequiz.marktrevino.com';
const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

export function getFrontendBaseUrl(): string {
    const envUrl = process.env.FRONTEND_BASE_URL;
    if (envUrl) {
        return envUrl.replace(/\/+$/, '');
    }
    if (process.env.NODE_ENV === 'production') {
        return PRODUCTION_FRONTEND_URL;
    }
    return DEFAULT_FRONTEND_URL;
}
