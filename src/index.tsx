import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Keycloak from "keycloak-js";
import { StoreProvider } from "easy-peasy";
import keycloakConf from "@/UI/Root/keycloak.json";
import { App } from "@/UI/Root/app";
import {
  DependencyProvider,
  CommandManagerResolver,
  QueryManagerResolver,
  EnvironmentModifierImpl,
} from "@/UI/Dependency";
import {
  CommandResolverImpl,
  QueryResolverImpl,
  BaseApiHelper,
  KeycloakAuthHelper,
  getStoreInstance,
  FileFetcherImpl,
  PrimaryFeatureManager,
} from "@/Data";
import { UrlManagerImpl } from "@/UI/Utils";
import { PrimaryBaseUrlManager, PrimaryRouteManager } from "@/UI/Routing";

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

const STORE = getStoreInstance();
const baseUrlManager = new PrimaryBaseUrlManager(location.pathname);
const CONSOLE_BASE_URL = baseUrlManager.getConsoleBaseUrl();
const BASE_URL = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
const routeManager = new PrimaryRouteManager(CONSOLE_BASE_URL);
const apiHelper = new BaseApiHelper(BASE_URL, keycloak);
const queryResolver = new QueryResolverImpl(
  new QueryManagerResolver(STORE, apiHelper)
);
const commandResolver = new CommandResolverImpl(
  new CommandManagerResolver(STORE, apiHelper, new KeycloakAuthHelper(keycloak))
);
const urlManager = new UrlManagerImpl(BASE_URL);
const fileFetcher = new FileFetcherImpl(apiHelper);
const environmentModifier = new EnvironmentModifierImpl();
const featureManager = new PrimaryFeatureManager();

ReactDOM.render(
  <DependencyProvider
    dependencies={{
      queryResolver,
      commandResolver,
      urlManager,
      fileFetcher,
      environmentModifier,
      featureManager,
      routeManager,
    }}
  >
    <StoreProvider store={STORE}>
      <Router>
        <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
      </Router>
    </StoreProvider>
  </DependencyProvider>,
  document.getElementById("root") as HTMLElement
);
