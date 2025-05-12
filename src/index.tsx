import "@patternfly/react-core/dist/styles/base.css";
import "@/Core/Language/Extensions";
import React from "react";
import loader from "@monaco-editor/loader";
import { Flex } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import { createRoot } from "react-dom/client";
import { Root } from "@/UI/Root";
import { AuthProvider } from "./Data/Auth/AuthProvider";
import { QueryControlProvider } from "./Data/Managers/V2/helpers/QueryControlContext";
import { Injector } from "./Injector";
import CustomRouter from "./UI/Routing/CustomRouter";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";

loader.config({ monaco });
loader.init();

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

// We don't want to retry requests, especially in the continuous queries, there it would could result in infinite loop if the request takes longer than the interval.
// Fail fast is the better option here, especially as we display functionality to refetch the data.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

root.render(
  <ErrorBoundary>
    <QueryControlProvider>
      <QueryClientProvider client={queryClient}>
        <CustomRouter>
          <AuthProvider config={globalThis && globalThis.auth}>
            <Flex
              flexWrap={{ default: "nowrap" }}
              spaceItems={{ default: "spaceItemsNone" }}
              direction={{ default: "column" }}
              style={{ height: "100%" }}
            >
              <Injector>
                <Root />
              </Injector>
            </Flex>
          </AuthProvider>
        </CustomRouter>
      </QueryClientProvider>
    </QueryControlProvider>
  </ErrorBoundary>
);
