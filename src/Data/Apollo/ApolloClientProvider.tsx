import React, { useContext, useEffect, useState } from "react";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  RefetchEventManager,
} from "@apollo/client";
import { GraphQL17Alpha9Handler } from "@apollo/client/incremental";
import { LocalState } from "@apollo/client/local-state";
import { ApolloProvider } from "@apollo/client/react";
import { AuthContext } from "@/Data/Auth";
import { REFETCH_INTERVAL } from "@/Data/Queries/Helpers/globals";
import { PrimaryBaseUrlManager } from "@/UI";
import { abortSafeResponse } from "./abortSafeResponse";
import { createLocalResolvers } from "./localResolvers";
import { createPoll } from "./poll";

/**
 * Provides an Apollo Client for the GraphQL endpoint of the orchestrator.
 * The client understands incremental delivery, so queries can use `@defer` and receive each part as it resolves.
 */

/** How long the poll waits after a local change, so the change stays on screen before server data replaces it. */
const LOCAL_CHANGE_PAUSE_MS = 30_000;

/**
 * Creates the Apollo Client. Data masking is on, so a component only sees the fields it selects itself
 * and reads the fields of its children's fragments through their own `useFragment`.
 * Queries that pass `refetchOn: { poll: true }` refetch once the network has been quiet for REFETCH_INTERVAL.
 *
 * @example
 * const client = createApolloClient({ getToken: () => "token" });
 * client.cache.identify({ __typename: "Resource", resourceId: "std::File[agent,path=/a]" })
 * // "Resource:{\"resourceId\":\"std::File[agent,path=/a]\"}"
 */
export const createApolloClient = ({
  uri = "/api/v2/graphql",
  getToken,
}: {
  uri?: string;
  getToken: () => string | null;
}) => {
  const poll = createPoll(REFETCH_INTERVAL);

  const httpLink = new HttpLink({
    uri,
    // The endpoint only accepts `query`, `variables` and `operationName`, any other body field is rejected.
    includeExtensions: false,
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      const accept = headers.get("Accept") ?? "application/json";
      const token = getToken();

      // Without multipart/mixed in Accept, the endpoint wraps its response in an extra envelope
      // that Apollo can't read. With it, every response is a standard GraphQL result.
      if (!accept.includes("multipart/mixed")) {
        headers.set("Accept", `multipart/mixed, ${accept}`);
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return fetch(input, { ...init, headers }).then((response) =>
        abortSafeResponse(response, init?.signal)
      );
    },
  });

  return new ApolloClient({
    link: ApolloLink.from([poll.link, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Resource: { keyFields: ["resourceId"] },
        ResourcePersistentState: { keyFields: ["resourceId"] },
        ComposedResourceSummary: { merge: true },
      },
    }),
    dataMasking: true,
    incrementalHandler: new GraphQL17Alpha9Handler(),
    refetchEventManager: new RefetchEventManager({
      sources: { poll: poll.source },
      handlers: { poll: poll.handler },
    }),
    defaultOptions: { watchQuery: { refetchOn: false } },
    localState: new LocalState({
      resolvers: createLocalResolvers({ pausePolling: () => poll.pause(LOCAL_CHANGE_PAUSE_MS) }),
    }),
  });
};

/**
 * Wraps its children in an ApolloProvider with a client that sends the current auth token on every request.
 * The client is created once per mount, so the cache lives as long as the provider.
 *
 * @prop {React.ReactNode} children - The tree that can use Apollo hooks.
 *
 * @example
 * <ApolloClientProvider>
 *   <ResourcesPage />
 * </ApolloClientProvider>
 */
export const ApolloClientProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const authHelper = useContext(AuthContext);

  const [client] = useState(() => {
    const baseUrl = new PrimaryBaseUrlManager(
      globalThis.location.origin,
      globalThis.location.pathname
    ).getBaseUrl();

    return createApolloClient({
      uri: baseUrl + "/api/v2/graphql",
      getToken: () => authHelper.getToken(),
    });
  });

  // Stop the poll when the provider unmounts. Connecting again is a no-op if already connected.
  useEffect(() => {
    client.refetchEventManager?.connect(client);

    return () => client.refetchEventManager?.disconnect(client);
  }, [client]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
