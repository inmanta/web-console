import React from "react";
import ReactDOM from "react-dom";
import { App } from "@/UI/App/app";
import keycloakConf from "@/UI/App/keycloak.json";
import Keycloak from "keycloak-js";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI";
import {
  DependencyManagerContext,
  DependencyManagerImpl,
  RootDependencyManagerContext,
  RootDependencyManagerImpl,
} from "@/UI/Dependency";
import { BaseApiHelper } from "./Infra";

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

const storeInstance = getStoreInstance();
const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
const baseApiHelper = new BaseApiHelper(baseUrl, keycloak);
const rootDependencyManager = new RootDependencyManagerImpl(
  storeInstance,
  baseApiHelper
);
const dependencyManager = new DependencyManagerImpl(
  storeInstance,
  baseApiHelper,
  baseUrl
);

ReactDOM.render(
  <RootDependencyManagerContext.Provider value={rootDependencyManager}>
    <DependencyManagerContext.Provider value={dependencyManager}>
      <StoreProvider store={storeInstance}>
        <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
      </StoreProvider>
    </DependencyManagerContext.Provider>
  </RootDependencyManagerContext.Provider>,
  document.getElementById("root") as HTMLElement
);
