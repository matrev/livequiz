import { getFrontendBaseUrl } from './getFrontendBaseUrl';

describe('getFrontendBaseUrl', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.FRONTEND_BASE_URL;
        delete process.env.NODE_ENV;
    });

    afterAll(() => {
        process.env = originalEnv;
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
