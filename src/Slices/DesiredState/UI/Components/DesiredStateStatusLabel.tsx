import React from "react";
import { Label } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";

/**
 * DesiredStateStatusLabel Component
 *
 * When the status is active, the label will be green.
 * When the status is skipped_candidate, the label will be yellow.
 * When the status is candidate, the label will be blue.
 * When the status is retired, the label will be outlined.
 *
 * @param {DesiredStateVersionStatus} status - The Status of the desired state version.
 * @returns A React label component with the status of the desired state version.
 */
export const DesiredStateStatusLabel: React.FC<{
  status: DesiredStateVersionStatus;
}> = ({ status }) => {
  switch (status) {
    case DesiredStateVersionStatus.active:
      return (
        <Label status="success" variant="outline">
          {status}
        </Label>
      );
    case DesiredStateVersionStatus.skipped_candidate:
      return (
        <Label status="warning" variant="outline">
          {status}
        </Label>
      );
    case DesiredStateVersionStatus.candidate:
      return (
        <Label color="blue" variant="outline" icon={<InfoAltIcon />}>
          {status}
        </Label>
      );
    case DesiredStateVersionStatus.retired:
      return <Label variant="outline">{status}</Label>;
  }
};
