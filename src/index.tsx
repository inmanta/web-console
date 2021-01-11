import React from "react";
import ReactDOM from "react-dom";
import { App } from "@app/index";
import keycloakConf from "./app/keycloak.json";
import Keycloak from "keycloak-js";

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

ReactDOM.render(
  <App keycloak={keycloak} shouldUseAuth={shouldUseAuth} />,
  document.getElementById("root") as HTMLElement
);
