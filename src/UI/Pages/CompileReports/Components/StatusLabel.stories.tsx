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
    <StatusLabel status={CompileStatus.success} />
    <Spacer />
    <StatusLabel status={CompileStatus.failed} />
    <Spacer />
    <StatusLabel status={CompileStatus.inprogress} />
    <Spacer />
    <StatusLabel status={CompileStatus.queued} />
  </>
);
