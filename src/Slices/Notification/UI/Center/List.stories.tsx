import React from "react";
import { BrowserRouter } from "react-router-dom";
import { dependencies, MockCommandManager } from "@/Test";
import { DependencyProvider, PrimaryRouteManager } from "@/UI";
import * as Mock from "@S/Notification/Core/Mock";
import { List } from "./List";

export default {
  title: "Notification/Center/List",
  component: List,
};

export const Default = () => (
  <BrowserRouter>
    <DependencyProvider
      dependencies={{
        ...dependencies,
        routeManager: new PrimaryRouteManager(""),
        commandResolver: new MockCommandManager(),
      }}
    >
      <List data={Mock.list} onUpdate={() => undefined} />
    </DependencyProvider>
  </BrowserRouter>
);
