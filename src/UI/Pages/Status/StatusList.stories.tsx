import React from "react";
import { dependencies, ServerStatus } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { StatusList } from "./StatusList";

export default {
  title: "StatusList",
  component: StatusList,
};

export const Default = () => (
  <DependencyProvider dependencies={dependencies}>
    <StatusList status={ServerStatus.withLsm} apiUrl="www.example.com" />
  </DependencyProvider>
);
