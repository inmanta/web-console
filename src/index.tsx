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

loader.config({ monaco });
loader.init();

const store = getStoreInstance();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
const queryClient = new QueryClient();

root.render(
  <ErrorBoundary>
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
  </ErrorBoundary>,
);
