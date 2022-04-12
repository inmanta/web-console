import React from "react";
import { DesiredStateVersionStatus } from "@/Core/Domain/DesiredStateVersionStatus";
import { StatusLabel } from "./StatusLabel";

export default {
  title: "DesiredState/StatusLabel",
  component: StatusLabel,
};

export const Default: React.FC = () => (
  <>
    <StatusLabel status={DesiredStateVersionStatus.active} />
    <StatusLabel status={DesiredStateVersionStatus.candidate} />
    <StatusLabel status={DesiredStateVersionStatus.skipped_candidate} />
    <StatusLabel status={DesiredStateVersionStatus.retired} />
  </>
);
