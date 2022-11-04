import "@patternfly/react-core/dist/styles/base.css";
import "@/Core/Language/Extensions";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { createRoot } from "react-dom/client";
import { getStoreInstance } from "@/Data";
import { Root } from "@/UI/Root";
import { Injector } from "./Injector";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";

const store = getStoreInstance();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <StoreProvider store={store}>
      <Router>
        <Injector store={store}>
          <Root />
        </Injector>
      </Router>
    </StoreProvider>
  </ErrorBoundary>
);
