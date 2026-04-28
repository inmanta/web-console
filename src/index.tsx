import "@patternfly/react-core/dist/styles/base.css";
import "monaco-editor/min/vs/editor/editor.main.css";
import "@/Core/Language/Extensions";
import { loader } from "@monaco-editor/react";
import { Flex } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import { createRoot } from "react-dom/client";
import { Root } from "@/UI/Root";
import { AuthProvider } from "./Data/Auth/AuthProvider";
import { QueryControlProvider } from "./Data/Queries";
import { Injector } from "./Injector";
import CustomRouter from "./UI/Routing/CustomRouter";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";
import { createMonacoWorker } from "./monaco-workers";

// Monaco worker configuration. Uses getWorker (returns a Worker instance) rather than
// getWorkerUrl so that Vite's worker bundling sets the correct module type automatically.
self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    return createMonacoWorker(label);
  },
};

// Register JSON language
monaco.languages.register({ id: "json" });
monaco.languages.setMonarchTokensProvider("json", {
  tokenizer: {
    root: [
      [/[{}]/, "delimiter.bracket"],
      [/[[\]]/, "delimiter.array"],
      [/:/, "delimiter"],
      [/,/, "delimiter"],
      [/"[^"]*"/, "string"],
      [/true|false|null/, "keyword"],
      [/\d+/, "number"],
    ],
  },
});

// Register XML language
monaco.languages.register({ id: "xml" });
monaco.languages.setMonarchTokensProvider("xml", {
  tokenizer: {
    root: [
      [/</, "delimiter"],
      [/>/, "delimiter"],
      [/[^<>]+/, "string"],
    ],
  },
});

// Register Python language
monaco.languages.register({ id: "python" });
monaco.languages.setMonarchTokensProvider("python", {
  tokenizer: {
    root: [
      [/#.*$/, "comment"],
      [/def|class|if|else|elif|for|while|try|except|finally|with|as|import|from/, "keyword"],
      [/True|False|None/, "keyword"],
      [/"[^"]*"/, "string"],
      [/'[^']*'/, "string"],
      [/\d+/, "number"],
    ],
  },
});

// Register plain text language
monaco.languages.register({ id: "plaintext" });

// Pass the locally-bundled monaco instance so the loader never fetches from the
// default jsdelivr CDN. Override paths.vs as a belt-and-suspenders guard: if
// state.monaco were somehow unset, the fallback script URL would be relative
// (/loader.js) instead of the CDN URL.
loader.config({ monaco, paths: { vs: "" } });
loader.init();

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

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
