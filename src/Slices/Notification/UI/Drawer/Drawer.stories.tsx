import React from "react";
import { RemoteData } from "@/Core";
import * as Mock from "@S/Notification/Core/Mock";
import { View } from "./Drawer";

export default {
  title: "Notification/Drawer",
  component: View,
};

export const Default = () => (
  <View
    data={RemoteData.success(Mock.data)}
    onClose={() => alert("close")}
    trigger={() => undefined}
    drawerRef={{ current: undefined }}
  />
);
