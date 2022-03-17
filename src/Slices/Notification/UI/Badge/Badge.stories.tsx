import React from "react";
import { RemoteData } from "@/Core";
import { Spacer } from "@/UI/Components";
import * as Mock from "@S/Notification/Core/Mock";
import { View } from "./Badge";

export default {
  title: "Notification/Badge",
  component: View,
};

export const Variants = () => (
  <>
    <p>Loading: </p>
    <View data={RemoteData.loading()} />
    <Spacer />
    <p>Failed: </p>
    <View data={RemoteData.failed("error xyz")} />
    <Spacer />
    <p>Read:</p>
    <View data={RemoteData.success({ ...Mock.data, data: [Mock.read] })} />
    <Spacer />
    <p>Unread:</p>
    <View data={RemoteData.success({ ...Mock.data, data: [Mock.unread] })} />
    <Spacer />
    <p>Severity Error:</p>
    <View data={RemoteData.success({ ...Mock.data, data: [Mock.error] })} />
    <Spacer />
  </>
);
