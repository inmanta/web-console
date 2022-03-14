import React from "react";
import { CompileStatus } from "@/Core";
import { Spacer } from "@/UI/Components";
import { StatusLabel } from "./StatusLabel";

export default {
  title: "CompileReport/StatusLabel",
  component: StatusLabel,
};

export const Default = () => (
  <>
    <StatusLabel status={CompileStatus.Success} />
    <Spacer />
    <StatusLabel status={CompileStatus.Failed} />
    <Spacer />
    <StatusLabel status={CompileStatus.InProgress} />
    <Spacer />
    <StatusLabel status={CompileStatus.Queued} />
  </>
);
