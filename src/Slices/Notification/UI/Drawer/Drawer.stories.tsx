import React from "react";
import { BrowserRouter } from "react-router-dom";
import { RemoteData } from "@/Core";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import * as Mock from "@S/Notification/Core/Mock";
import { View } from "./Drawer";

export default {
  title: "Notification/Drawer",
  component: View,
};

export const Default = () => (
  <BrowserRouter>
    <DependencyProvider
      dependencies={{
        ...dependencies,
        routeManager: new PrimaryRouteManager(""),
      }}
    >
      <View
        data={RemoteData.success(Mock.data)}
        onClose={() => alert("close")}
        drawerRef={{ current: undefined }}
        trigger={() => undefined}
      />
    </DependencyProvider>
  </BrowserRouter>
);
