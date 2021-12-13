import "@patternfly/react-core/dist/styles/base.css";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { App } from "@/UI/Root/app";
import { Injector } from "./Injector";

if (process.env.NODE_ENV !== "production") {
  /* eslint-disable-next-line @typescript-eslint/no-var-requires */
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}

const store = getStoreInstance();

ReactDOM.render(
  <StoreProvider store={store}>
    <Router>
      <Injector store={store}>
        <App />
      </Injector>
    </Router>
  </StoreProvider>,
  document.getElementById("root") as HTMLElement
);
