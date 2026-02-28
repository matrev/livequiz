import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";

import { resolvers } from "./graphql/resolvers/resolvers.js";
import { ResolverContext, createResolverContext } from "./prisma.js";
import { typeDefs } from "./graphql/utils.js";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscriptions",
});

const wsServerCleanup = useServer(
  {
    schema,
    context: async () => createResolverContext(),
  },
  wsServer
);

const server = new ApolloServer<ResolverContext>({
  schema,
  introspection: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await wsServerCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

const host = process.env.HOST ?? "0.0.0.0";
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT ?? ""}`);
}

const configuredCorsOrigins =
  process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const corsOrigins =
  configuredCorsOrigins.length > 0
    ? configuredCorsOrigins
    : process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:3000"];

const corsOrigin: cors.CorsOptions["origin"] =
  corsOrigins.length === 0
    ? false
    : corsOrigins.length === 1
      ? corsOrigins[0]
      : corsOrigins;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(
  "/graphql",
  cors<cors.CorsRequest>({
    origin: corsOrigin,
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async () => createResolverContext(),
  })
);

await new Promise<void>((resolve) => {
  httpServer.listen({ host, port }, resolve);
});

const logHost = host === "0.0.0.0" ? "localhost" : host;
console.log(`🚀 GraphQL HTTP ready at: http://${logHost}:${port}/graphql`);
console.log(`🚀 GraphQL WS ready at: ws://${logHost}:${port}/subscriptions`);