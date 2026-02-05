import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\\.{1,2}/.+)\\.js$": "$1",
    },
    testPathIgnorePatterns: ["/dist/"],
    rootDir: "../",
};

export default config;