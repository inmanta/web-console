import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import {
  CommandResolverImpl,
  QueryResolverImpl,
  BaseApiHelper,
  KeycloakAuthHelper,
  getStoreInstance,
  FileFetcherImpl,
  PrimaryFeatureManager,
  CommandManagerResolver,
  QueryManagerResolver,
} from "@/Data";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { App } from "@/UI/Root/app";
import keycloakConf from "@/UI/Root/keycloak.json";
import { PrimaryBaseUrlManager, PrimaryRouteManager } from "@/UI/Routing";
import { UrlManagerImpl } from "@/UI/Utils";

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
const baseUrlManager = new PrimaryBaseUrlManager(location.pathname);
const consoleBaseUrl = baseUrlManager.getConsoleBaseUrl();
const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
const routeManager = new PrimaryRouteManager(consoleBaseUrl);
const apiHelper = new BaseApiHelper(baseUrl, keycloak);
const queryResolver = new QueryResolverImpl(
  new QueryManagerResolver(store, apiHelper)
);
const commandResolver = new CommandResolverImpl(
  new CommandManagerResolver(store, apiHelper, new KeycloakAuthHelper(keycloak))
);
const featureManager = new PrimaryFeatureManager();
const urlManager = new UrlManagerImpl(featureManager, baseUrl);
const fileFetcher = new FileFetcherImpl(apiHelper);
const environmentModifier = new EnvironmentModifierImpl();

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
    <StoreProvider store={store}>
      <Router>
        <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
      </Router>
    </StoreProvider>
  </DependencyProvider>,
  document.getElementById("root") as HTMLElement
);
