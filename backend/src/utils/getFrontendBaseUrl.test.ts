import { getFrontendBaseUrl } from './getFrontendBaseUrl.js';

describe('getFrontendBaseUrl', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalFrontendBaseUrl = process.env.FRONTEND_BASE_URL;

    beforeEach(() => {
        // Ensure FRONTEND_BASE_URL is unset for each test unless explicitly set.
        if (originalFrontendBaseUrl === undefined) {
            delete process.env.FRONTEND_BASE_URL;
        } else {
            process.env.FRONTEND_BASE_URL = undefined as any;
        }
        // Keep NODE_ENV stable unless a test overrides it.
        process.env.NODE_ENV = originalNodeEnv;
    });

    afterEach(() => {
        // Restore original values after each test to avoid cross-test pollution.
        process.env.NODE_ENV = originalNodeEnv;
        if (originalFrontendBaseUrl === undefined) {
            delete process.env.FRONTEND_BASE_URL;
        } else {
            process.env.FRONTEND_BASE_URL = originalFrontendBaseUrl;
        }
    });

    it('returns FRONTEND_BASE_URL when set', () => {
        process.env.FRONTEND_BASE_URL = 'https://custom.example.com';
        expect(getFrontendBaseUrl()).toBe('https://custom.example.com');
    });

    it('strips trailing slashes from FRONTEND_BASE_URL', () => {
        process.env.FRONTEND_BASE_URL = 'https://custom.example.com///';
        expect(getFrontendBaseUrl()).toBe('https://custom.example.com');
    });

    it('returns production URL when NODE_ENV is production and FRONTEND_BASE_URL is not set', () => {
        process.env.NODE_ENV = 'production';
        expect(getFrontendBaseUrl()).toBe('https://livequiz.marktrevino.com');
    });

    it('returns localhost URL when NODE_ENV is not production and FRONTEND_BASE_URL is not set', () => {
        process.env.NODE_ENV = 'development';
        expect(getFrontendBaseUrl()).toBe('http://localhost:3000');
    });

    it('returns localhost URL when neither NODE_ENV nor FRONTEND_BASE_URL is set', () => {
        expect(getFrontendBaseUrl()).toBe('http://localhost:3000');
    });

    it('prefers FRONTEND_BASE_URL over NODE_ENV', () => {
        process.env.NODE_ENV = 'production';
        process.env.FRONTEND_BASE_URL = 'https://override.example.com';
        expect(getFrontendBaseUrl()).toBe('https://override.example.com');
    });
});
