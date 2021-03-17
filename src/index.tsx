import React from "react";
import ReactDOM from "react-dom";
import { App } from "@/UI/App/app";
import keycloakConf from "@/UI/App/keycloak.json";
import Keycloak from "keycloak-js";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance, ServicesContext } from "@/UI";
import {
  BaseApiHelper,
  EventsFetcher,
  ResourcesFetcher,
  ServiceFetcher,
  ServiceInstancesFetcher,
  ServiceInstanceLogsFetcher,
  ServicesFetcher,
} from "@/Infra";
import {
  DataProviderImpl,
  IntervalsDictionary,
  LiveSubscriptionController,
  ServiceHookHelper,
  ServiceKeyMaker,
  ServiceStateHelper,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
  ResourcesStateHelper,
  ResourcesHookHelper,
  EventsHookHelper,
  EventsStateHelper,
  ServicesHookHelper,
  ServicesStateHelper,
  DataManagerImpl,
  InstanceLogsHookHelper,
  InstanceLogsStateHelper,
} from "@/UI/Data";
import { identity } from "lodash";

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

const servicesHelper = new ServicesHookHelper(
  new DataManagerImpl<"Services">(
    new ServicesFetcher(baseApiHelper),
    new ServicesStateHelper(storeInstance, serviceKeyMaker),
    identity
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const serviceHelper = new ServiceHookHelper(
  new DataManagerImpl<"Service">(
    new ServiceFetcher(baseApiHelper),
    new ServiceStateHelper(storeInstance, serviceKeyMaker),
    identity
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary()),
  serviceKeyMaker
);

const serviceInstancesHelper = new ServiceInstancesHookHelper(
  new DataManagerImpl<"ServiceInstances">(
    new ServiceInstancesFetcher(baseApiHelper),
    new ServiceInstancesStateHelper(storeInstance),
    (data) => {
      return {
        data: data.data,
        handlers: {
          prev: () => console.log({ prev: data.links.prev }),
          next: () => console.log({ next: data.links.next }),
        },
      };
    }
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const resourcesHelper = new ResourcesHookHelper(
  new DataManagerImpl<"Resources">(
    new ResourcesFetcher(baseApiHelper),
    new ResourcesStateHelper(storeInstance),
    identity
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const eventsHelper = new EventsHookHelper(
  new DataManagerImpl<"Events">(
    new EventsFetcher(baseApiHelper),
    new EventsStateHelper(storeInstance),
    identity
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const instanceLogsHelper = new InstanceLogsHookHelper(
  new DataManagerImpl<"InstanceLogs">(
    new ServiceInstanceLogsFetcher(baseApiHelper),
    new InstanceLogsStateHelper(storeInstance),
    identity
  ),
  new LiveSubscriptionController(5000, new IntervalsDictionary())
);

const dataProvider = new DataProviderImpl([
  servicesHelper,
  serviceHelper,
  serviceInstancesHelper,
  resourcesHelper,
  eventsHelper,
  instanceLogsHelper,
]);

ReactDOM.render(
  <ServicesContext.Provider value={{ dataProvider }}>
    <StoreProvider store={storeInstance}>
      <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
    </StoreProvider>
  </ServicesContext.Provider>,
  document.getElementById("root") as HTMLElement
);
