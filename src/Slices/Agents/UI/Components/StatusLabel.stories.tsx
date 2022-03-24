import React from "react";
import { Spacer } from "@/UI/Components";
import { AgentStatus } from "@S/Agents/Core/Model";
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
