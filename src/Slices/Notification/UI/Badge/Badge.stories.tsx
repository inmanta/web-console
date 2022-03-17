import React from "react";
import { RemoteData } from "@/Core";
import { Spacer } from "@/UI/Components";
import * as Mock from "@S/Notification/Core/Mock";
import { View } from "./Badge";

export default {
  title: "Notification/Badge",
  component: View,
};

const cb = () => undefined;

export const Variants = () => (
  <>
    <p>Loading: </p>
    <View data={RemoteData.loading()} onClick={cb} />
    <Spacer />
    <p>Failed: </p>
    <View data={RemoteData.failed("error xyz")} onClick={cb} />
    <Spacer />
    <p>Read:</p>
    <View
      data={RemoteData.success({ ...Mock.data, data: [Mock.read] })}
      onClick={cb}
    />
    <Spacer />
    <p>Unread:</p>
    <View
      data={RemoteData.success({ ...Mock.data, data: [Mock.unread] })}
      onClick={cb}
    />
    <Spacer />
    <p>Severity Error:</p>
    <View
      data={RemoteData.success({ ...Mock.data, data: [Mock.error] })}
      onClick={cb}
    />
    <Spacer />
  </>
);
