import "@patternfly/react-core/dist/styles/base.css";
import "./setup";
import "@/Core/Language/Extensions";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { Root } from "@/UI/Root";
import { Injector } from "./Injector";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";

const store = getStoreInstance();

ReactDOM.render(
  <ErrorBoundary>
    <StoreProvider store={store}>
      <Router>
        <Injector store={store}>
          <Root />
        </Injector>
      </Router>
    </StoreProvider>
  </ErrorBoundary>,
  document.getElementById("root") as HTMLElement
);
