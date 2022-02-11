import React from "react";
import { AgentStatus } from "@/Core";
import { Spacer } from "@/UI/Components";
import { StatusLabel } from "./StatusLabel";

export default {
  title: "AgentStatusLabel",
  component: StatusLabel,
};

export const Default = () => (
  <>
    <StatusLabel status={AgentStatus.up} />
    <Spacer />
    <StatusLabel status={AgentStatus.down} />
    <Spacer />
    <StatusLabel status={AgentStatus.paused} />
  </>
);
