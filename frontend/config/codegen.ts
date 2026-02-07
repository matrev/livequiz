import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "http://localhost:4000", //change to local file path if server is not running
    documents: ["./src/**/*.{ts,tsx,js,jsx,graphql}"],
    generates: {
        "./src/generated/": {
            preset: "client",
            presetConfig: {
                gqlTagName: "gql"
            }
        },
        "./src/generated/types.ts": {
            plugins: ["typescript", "typescript-operations"],
        }
    },
};

export default config;