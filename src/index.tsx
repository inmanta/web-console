import React from "react";
import ReactDOM from "react-dom";
import { App } from '@app/index';
import keycloakConf from './app/keycloak.json';
import Keycloak from "keycloak-js";

if (process.env.NODE_ENV !== "production") {
  // tslint:disable-next-line
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}


const customKeycloakConf = { ...keycloakConf, "url": process.env.KEYCLOAK_URL }
const keycloak = Keycloak(customKeycloakConf);

ReactDOM.render(<App keycloak={keycloak}/>, document.getElementById("root") as HTMLElement);
