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
  ProjectsProviderContext,
} from "@/UI/Dependency";
import { BaseApiHelper, FetcherImpl } from "./Infra";
import {
  DataProviderImpl,
  ProjectsDataManager,
  ProjectsStateHelper,
} from "./UI/Data";

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
const stateHelper = new ProjectsStateHelper(storeInstance);
const projectsManager = new ProjectsDataManager(
  new FetcherImpl<"Projects">(baseApiHelper),
  stateHelper
);
const projectsProvider = new DataProviderImpl([projectsManager]);
const dependencyManager = new DependencyManagerImpl(
  storeInstance,
  baseApiHelper
);

ReactDOM.render(
  <ProjectsProviderContext.Provider value={projectsProvider}>
    <DependencyManagerContext.Provider value={dependencyManager}>
      <StoreProvider store={storeInstance}>
        <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
      </StoreProvider>
    </DependencyManagerContext.Provider>
  </ProjectsProviderContext.Provider>,
  document.getElementById("root") as HTMLElement
);
