import "@patternfly/react-core/dist/styles/base.css";
import "./setup";
import "@/Core/Language/Extensions";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { Root } from "@/UI/Root";
import { Injector } from "./Injector";

const store = getStoreInstance();

ReactDOM.render(
  <StoreProvider store={store}>
    <Router>
      <Injector store={store}>
        <Root />
      </Injector>
    </Router>
  </StoreProvider>,
  document.getElementById("root") as HTMLElement
);
