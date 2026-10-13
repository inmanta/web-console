import React, { PropsWithChildren } from "react";
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
 * Children show after the status, e.g. the version number, so the version carries its status color.
 *
 * @prop {DesiredStateVersionStatus} status - The Status of the desired state version.
 * @prop {React.ReactNode} [children] - Shown after the status, e.g. "v5" for "active v5".
 * @returns A React label component with the status of the desired state version.
 */
export const DesiredStateStatusLabel: React.FC<
  PropsWithChildren<{
    status: DesiredStateVersionStatus;
  }>
> = ({ status, children }) => {
  const text = children ? (
    <>
      {status} {children}
    </>
  ) : (
    status
  );

  switch (status) {
    case DesiredStateVersionStatus.active:
      return (
        <Label status="success" variant="outline">
          {text}
        </Label>
      );
    case DesiredStateVersionStatus.skipped_candidate:
      return (
        <Label status="warning" variant="outline">
          {text}
        </Label>
      );
    case DesiredStateVersionStatus.candidate:
      return (
        <Label color="blue" variant="outline" icon={<InfoAltIcon />}>
          {text}
        </Label>
      );
    case DesiredStateVersionStatus.retired:
      return <Label variant="outline">{text}</Label>;
  }
};
