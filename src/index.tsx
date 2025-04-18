import "@patternfly/react-core/dist/styles/base.css";
import "@/Core/Language/Extensions";
import React from "react";
import loader from "@monaco-editor/loader";
import { Flex } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "easy-peasy";
import * as monaco from "monaco-editor";
import { createRoot } from "react-dom/client";
import { getStoreInstance } from "@/Data";
import { Root } from "@/UI/Root";
import { AuthProvider } from "./Data/Auth/AuthProvider";
import { Injector } from "./Injector";
import CustomRouter from "./UI/Routing/CustomRouter";
import history from "./UI/Routing/history";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";
import { QueryControlProvider } from "./Data/Managers/V2/helpers/QueryControlContext";

loader.config({ monaco });
loader.init();

const store = getStoreInstance();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

// We don't want to retry requests, especially in the continuous queries, there it would could result in infinite loop if the request takes longer than the interval.
// Fail fast is the better option here, especially as we display functionality to refetch the data.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

root.render(
  <ErrorBoundary>
    <QueryControlProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProvider store={store}>
          <CustomRouter history={history}>
            <AuthProvider config={globalThis && globalThis.auth}>
              <Flex
                flexWrap={{ default: "nowrap" }}
                spaceItems={{ default: "spaceItemsNone" }}
                direction={{ default: "column" }}
                style={{ height: "100%" }}
              >
                <Injector store={store}>
                  <Root />
                </Injector>
              </Flex>
            </AuthProvider>
          </CustomRouter>
        </StoreProvider>
      </QueryClientProvider>
    </QueryControlProvider>
  </ErrorBoundary>
);
