import React from "react";
import { Resource } from "@/Core";
import { labelColorConfig, ResourceStatusLabel } from "@/UI/Components/ResourceStatus";

interface Props {
  status: string | null;
}

const isResourceStatus = (status: string): status is Resource.Status =>
  status in labelColorConfig;

/**
 * Displays the deploy status of a resource action, reusing the same label and
 * coloring as the resource status shown on the resource page.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string | null} status - The status of the resource action.
 * @returns {React.FC<Props>} The deploy status label.
 */
export const DeployStatusLabel: React.FC<Props> = ({ status }) => {
  if (!status || !isResourceStatus(status)) {
    return <>{status ?? "-"}</>;
  }

  return <ResourceStatusLabel status={labelColorConfig[status]} label={status} />;
};
