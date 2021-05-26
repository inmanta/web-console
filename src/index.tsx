import React from "react";
import ReactDOM from "react-dom";
import Keycloak from "keycloak-js";
import { StoreProvider } from "easy-peasy";
import {
  getStoreInstance,
  UrlManagerImpl,
  CommandResolverImpl,
  QueryResolverImpl,
  CommandManagerResolver,
  QueryManagerResolver,
  DependencyProvider,
} from "@/UI";
import { App } from "@/UI/App/app";
import keycloakConf from "@/UI/App/keycloak.json";
import { BaseApiHelper } from "@/Infra";

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
const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
const baseApiHelper = new BaseApiHelper(baseUrl, keycloak);
const queryResolver = new QueryResolverImpl(
  new QueryManagerResolver(store, baseApiHelper)
);
const commandResolver = new CommandResolverImpl(
  new CommandManagerResolver(store, baseApiHelper)
);
const urlManager = new UrlManagerImpl(baseUrl);

ReactDOM.render(
  <DependencyProvider
    dependencies={{ queryResolver, commandResolver, urlManager }}
  >
    <StoreProvider store={store}>
      <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
    </StoreProvider>
  </DependencyProvider>,
  document.getElementById("root") as HTMLElement
);
