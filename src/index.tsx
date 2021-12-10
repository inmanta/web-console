import "@patternfly/react-core/dist/styles/base.css";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { getStoreInstance } from "@/Data";
import { App } from "@/UI/Root/app";
import keycloakConf from "@/UI/Root/keycloak.json";
import { Injector } from "./Injector";

if (process.env.NODE_ENV !== "production") {
  /* eslint-disable-next-line @typescript-eslint/no-var-requires */
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}

// External configuration from the server
const externalKeycloakConf = globalThis && globalThis.auth;
const shouldUseAuth =
  process.env.SHOULD_USE_AUTH === "true" || externalKeycloakConf;
const customKeycloakConf = { ...keycloakConf, url: process.env.KEYCLOAK_URL };
let keycloak: Keycloak.KeycloakInstance;
if (externalKeycloakConf) {
  keycloak = Keycloak(externalKeycloakConf);
} else {
  keycloak = Keycloak(customKeycloakConf);
}

const store = getStoreInstance();

ReactDOM.render(
  <StoreProvider store={store}>
    <Router>
      <Injector store={store} keycloak={keycloak}>
        <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
      </Injector>
    </Router>
  </StoreProvider>,
  document.getElementById("root") as HTMLElement
);
