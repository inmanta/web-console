import "@patternfly/react-core/dist/styles/base.css";
import "@/Core/Language/Extensions";
import React from "react";
import { Flex } from "@patternfly/react-core";
import { StoreProvider } from "easy-peasy";
import { createRoot } from "react-dom/client";
import { getStoreInstance } from "@/Data";
import { Root } from "@/UI/Root";
import { Injector } from "./Injector";
import CustomRouter from "./UI/Routing/CustomRouter";
import history from "./UI/Routing/history";
import ErrorBoundary from "./UI/Utils/ErrorBoundary";

const store = getStoreInstance();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <StoreProvider store={store}>
      <CustomRouter history={history}>
        <Flex
          flexWrap={{ default: "nowrap" }}
          spaceItems={{ default: "spaceItemsNone" }}
          direction={{ default: "column" }}
          style={{ height: "100%" }}
        >
          <Injector store={store}>
            <Root />
          </Injector>
        </Flex>
      </CustomRouter>
    </StoreProvider>
  </ErrorBoundary>,
);
