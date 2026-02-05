import type {Config} from 'jest';
import { createDefaultPreset } from 'ts-jest';
const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
    verbose: true,
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\\.{1,2}/.+)\\.js$": "$1",
    },
    testPathIgnorePatterns: ["/dist/"],
};

export default config;