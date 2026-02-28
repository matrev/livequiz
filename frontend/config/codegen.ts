import { CodegenConfig } from "@graphql-codegen/cli";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const graphqlHttpUrl = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL;

if (!graphqlHttpUrl) {
    throw new Error(
        "Missing NEXT_PUBLIC_GRAPHQL_HTTP_URL. Set it in or frontend/.env."
    );
}

const config: CodegenConfig = {
    schema: graphqlHttpUrl,
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