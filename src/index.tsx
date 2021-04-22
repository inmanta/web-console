import React from "react";
import ReactDOM from "react-dom";
import { App } from "@/UI/App/app";
import keycloakConf from "@/UI/App/keycloak.json";
import Keycloak from "keycloak-js";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance, DependencyProvider } from "@/UI";
import { BaseApiHelper, FetcherImpl, InstanceConfigPoster } from "@/Infra";
import {
  DataProviderImpl,
  ServiceDataManager,
  ServiceKeyMaker,
  ServiceStateHelper,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
  ResourcesStateHelper,
  ResourcesDataManager,
  EventsDataManager,
  EventsStateHelper,
  ServicesDataManager,
  ServicesStateHelper,
  InstanceLogsDataManager,
  InstanceLogsStateHelper,
  InstanceConfigDataManager,
  InstanceConfigStateHelper,
  CommandProviderImpl,
} from "@/UI/Data";
import { SchedulerImpl } from "./Core";

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
const serviceKeyMaker = new ServiceKeyMaker();
const scheduler = new SchedulerImpl(5000);

const servicesHelper = new ServicesDataManager(
  new FetcherImpl<"Services">(baseApiHelper),
  new ServicesStateHelper(storeInstance, serviceKeyMaker),
  scheduler
);

const serviceHelper = new ServiceDataManager(
  new FetcherImpl<"Service">(baseApiHelper),
  new ServiceStateHelper(storeInstance, serviceKeyMaker),
  scheduler,
  serviceKeyMaker
);

const serviceInstancesHelper = new ServiceInstancesDataManager(
  new FetcherImpl<"ServiceInstances">(baseApiHelper),
  new ServiceInstancesStateHelper(storeInstance),
  scheduler
);

const resourcesHelper = new ResourcesDataManager(
  new FetcherImpl<"Resources">(baseApiHelper),
  new ResourcesStateHelper(storeInstance),
  scheduler
);

const eventsDataManager = new EventsDataManager(
  new FetcherImpl<"Events">(baseApiHelper),
  new EventsStateHelper(storeInstance),
  scheduler
);

const instanceLogsHelper = new InstanceLogsDataManager(
  new FetcherImpl<"InstanceLogs">(baseApiHelper),
  new InstanceLogsStateHelper(storeInstance)
);

const instanceConfigStateHelper = new InstanceConfigStateHelper(storeInstance);

const instanceConfigHelper = new InstanceConfigDataManager(
  new FetcherImpl<"InstanceConfig">(baseApiHelper),
  instanceConfigStateHelper,
  new ServiceStateHelper(storeInstance, serviceKeyMaker),
  new FetcherImpl<"Service">(baseApiHelper)
);

const dataProvider = new DataProviderImpl([
  servicesHelper,
  serviceHelper,
  serviceInstancesHelper,
  resourcesHelper,
  eventsDataManager,
  instanceLogsHelper,
  instanceConfigHelper,
]);

const commandProvider = new CommandProviderImpl(
  new InstanceConfigPoster(baseApiHelper),
  instanceConfigStateHelper
);

ReactDOM.render(
  <DependencyProvider dependencies={{ commandProvider, dataProvider }}>
    <StoreProvider store={storeInstance}>
      <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
    </StoreProvider>
  </DependencyProvider>,
  document.getElementById("root") as HTMLElement
);
