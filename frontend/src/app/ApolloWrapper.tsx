"use client";

import { HttpLink, split } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const httpUri =
  process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL ?? "http://localhost:4000/graphql";
const wsUri =
  process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? "ws://localhost:4000/subscriptions";

// have a function to create a client for you
function makeClient(): ApolloClient {
  const httpLink = new HttpLink({
    uri: httpUri,
  });

  if (typeof window === "undefined") {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: httpLink,
    });
  }

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUri,
      shouldRetry: () => true,
      retryAttempts: Infinity,
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}