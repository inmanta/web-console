import "@patternfly/react-core/dist/styles/base.css";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance, PrimaryKeycloakController } from "@/Data";
import { App } from "@/UI/Root/app";
import { Injector } from "./Injector";

if (process.env.NODE_ENV !== "production") {
  /* eslint-disable-next-line @typescript-eslint/no-var-requires */
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}

const keycloakController = new PrimaryKeycloakController(
  process.env.SHOULD_USE_AUTH,
  globalThis && globalThis.auth,
  process.env.KEYCLOAK_URL
);

const store = getStoreInstance();

ReactDOM.render(
  <StoreProvider store={store}>
    <Router>
      <Injector store={store} keycloak={keycloakController.getInstance()}>
        <App
          keycloak={keycloakController.getInstance()}
          shouldUseAuth={keycloakController.isEnabled()}
        />
      </Injector>
    </Router>
  </StoreProvider>,
  document.getElementById("root") as HTMLElement
);
