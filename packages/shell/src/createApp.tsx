import "@patternfly/react-core/dist/styles/base.css";
import "@inmanta/web-console-core/Language/Extensions";
import React from "react";
import { Flex } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { FeatureModule, getFeatureRoutes, RouteFactory } from "@inmanta/web-console-core";
import { QueryControlProvider } from "@inmanta/web-console-core/Queries/Helpers";
import { PrimaryBaseUrlManager } from "@inmanta/web-console-core/Routing";
import CustomRouter from "@inmanta/web-console-core/Routing/CustomRouter";
import ErrorBoundary from "@inmanta/web-console-ui/Utils/ErrorBoundary";
import { AuthProvider } from "./Auth/AuthProvider";
import { Injector } from "./Injector";
import { Root } from "./Root";
import { createRootRoutes } from "./RootRoutes";
import { AuthConfig, ShellOptions, ShellOptionsContext } from "./ShellOptions";
import { registerAppMessages } from "./registerAppMessages";
import { shellFeature } from "./shellFeature";

/**
 * What an app is made of: its features and the shell options.
 */
export interface AppOptions {
  /**
   * The features the app ships. The route table, pages and sidebar are built from them, so a
   * feature that is left out is absent from the app. The shell's own pages are added in front.
   *
   * Order matters: a url resolves to the first route whose path matches it, and sidebar entries
   * follow the order of the features. The environment feature must always be included: the
   * shell links to its pages without checking `routeManager.has`.
   */
  features: FeatureModule[];

  /**
   * How the shell is set up. Leaving it out uses the shell's defaults.
   */
  shell?: ShellOptions;
}

/**
 * An app composed with `createApp`.
 */
export interface App {
  /**
   * The features of the app: the shell's own, then the given ones.
   */
  features: FeatureModule[];

  /**
   * The routes of the features, in order.
   */
  routes: RouteFactory[];

  /**
   * Starts the app in the given element: registers the messages of its features and renders it.
   * Throws when the element is missing. Returns a function that unmounts the app again.
   */
  render(container: Element | null): () => void;
}

/**
 * Returns the auth settings to log in with: the settings from `config.js` for "from-config" or no
 * option, otherwise the option itself.
 */
export const getAuthConfig = (auth: ShellOptions["auth"]): AuthConfig | undefined =>
  auth === undefined || auth === "from-config" ? globalThis.auth : auth;

/**
 * Composes an app from the shell and the given features. Nothing starts until `render` is called,
 * so tests can look at the features and routes of an app without starting it.
 *
 * @example
 * createApp({ features: [environmentFeature, lsmFeature] }).render(document.getElementById("root"));
 */
export const createApp = ({ features, shell = {} }: AppOptions): App => {
  const appFeatures = [shellFeature, ...features];

  return {
    features: appFeatures,
    routes: getFeatureRoutes(appFeatures),
    render: (container) => {
      if (container === null) {
        throw new Error("createApp: the element to render the app in does not exist.");
      }

      registerAppMessages(appFeatures);

      // We don't want to retry requests, especially in the continuous queries, there it would could result in infinite loop if the request takes longer than the interval.
      // Fail fast is the better option here, especially as we display functionality to refetch the data.
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 5000,
          },
        },
      });

      const root = createRoot(container);

      root.render(
        <ShellOptionsContext.Provider value={shell}>
          <ErrorBoundary>
            <QueryControlProvider>
              <QueryClientProvider client={queryClient}>
                <CustomRouter
                  layout={
                    <AuthProvider config={getAuthConfig(shell.auth)}>
                      <Flex
                        flexWrap={{ default: "nowrap" }}
                        spaceItems={{ default: "spaceItemsNone" }}
                        direction={{ default: "column" }}
                        style={{ height: "100%" }}
                      >
                        <Injector features={appFeatures}>
                          <Root />
                        </Injector>
                      </Flex>
                    </AuthProvider>
                  }
                  routes={createRootRoutes(
                    new PrimaryBaseUrlManager(
                      globalThis.location.origin,
                      globalThis.location.pathname
                    ).getBasePathname(),
                    appFeatures
                  )}
                />
              </QueryClientProvider>
            </QueryControlProvider>
          </ErrorBoundary>
        </ShellOptionsContext.Provider>
      );

      return () => root.unmount();
    },
  };
};
