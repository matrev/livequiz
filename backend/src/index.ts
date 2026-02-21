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

app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async () => createResolverContext(),
  })
);

const port = 4000;
await new Promise<void>((resolve) => {
  httpServer.listen({ port }, resolve);
});

console.log(`🚀 GraphQL HTTP ready at: http://localhost:${port}/graphql`);
console.log(`🚀 GraphQL WS ready at: ws://localhost:${port}/subscriptions`);