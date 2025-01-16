import React from "react";
import { Label, Spinner } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { CompileStatus } from "@/Core";

/**
 * CompileStatusLabel component
 *
 * When a compile is in progress, the status is displayed with a spinner
 * When a compile is successful, the status is displayed with a success color
 * When a compile has failed, the status is displayed with a danger color
 * When a compile is queued, the status is displayed with an info color
 *
 * @param {CompileStatus} status - Status of the compile
 * @returns A React Component rendering a Label with the status of the compile
 */
export const CompileStatusLabel: React.FC<{ status: CompileStatus }> = ({
  status,
}) => {
  switch (status) {
    case CompileStatus.success:
      return (
        <Label status="success" variant="outline">
          {status}
        </Label>
      );
    case CompileStatus.failed:
      return (
        <Label status="danger" variant="outline">
          {status}
        </Label>
      );
    case CompileStatus.inprogress:
      return (
        <Label color="blue" icon={<Spinner size="sm" />} variant="outline">
          {status}
        </Label>
      );
    case CompileStatus.queued:
      return (
        <Label color="blue" variant="outline" icon={<InfoAltIcon />}>
          {status}
        </Label>
      );
  }
};
