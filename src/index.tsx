import React from "react";
import ReactDOM from "react-dom";
import { App } from "@app/index";
import keycloakConf from "./app/keycloak.json";
import Keycloak from "keycloak-js";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance, ServicesContext } from "@/UI";
import {
  BaseApiHelper,
  ResourcesFetcher,
  ServiceInstancesFetcher,
} from "@/Infra";
import {
  DataProviderImpl,
  IntervalsDictionary,
  ResourcesStateHelper,
  LiveSubscriptionController,
  ResourcesDataManager,
  ResourcesHookHelper,
  ServiceInstancesDataManager,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
} from "@/UI/Data";

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

const baseApiHelper = new BaseApiHelper(keycloak);

const resourcesHelper = new ResourcesHookHelper(
  new ResourcesDataManager(
    new ResourcesFetcher(baseApiHelper),
    new ResourcesStateHelper(storeInstance)
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const serviceInstancesHelper = new ServiceInstancesHookHelper(
  new ServiceInstancesDataManager(
    new ServiceInstancesFetcher(baseApiHelper),
    new ServiceInstancesStateHelper(storeInstance)
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const dataProvider = new DataProviderImpl([
  resourcesHelper,
  serviceInstancesHelper,
]);

ReactDOM.render(
  <ServicesContext.Provider value={{ dataProvider }}>
    <StoreProvider store={storeInstance}>
      <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
    </StoreProvider>
  </ServicesContext.Provider>,
  document.getElementById("root") as HTMLElement
);
