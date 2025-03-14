import "@patternfly/react-core/dist/styles/base.css";
import "@/Core/Language/Extensions";
import React from "react";
import { Flex } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "easy-peasy";
import { createRoot } from "react-dom/client";
import { getStoreInstance } from "@/Data";
import { Root } from "@/UI/Root";
import { AuthProvider } from "./Data/Auth/AuthProvider";
import { QueryControlProvider } from "./Data/Managers/V2/helpers/QueryControlContext";
import { Injector } from "./Injector";
import CustomRouter from "./UI/Routing/CustomRouter";
import history from "./UI/Routing/history";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";

const store = getStoreInstance();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
const queryClient = new QueryClient();

root.render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <QueryControlProvider>
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
      </QueryControlProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
