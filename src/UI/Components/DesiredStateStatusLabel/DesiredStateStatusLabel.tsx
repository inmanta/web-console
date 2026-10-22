import React, { PropsWithChildren } from "react";
import { Label, LabelProps } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { DesiredStateVersionStatus } from "@/Core/Domain/DesiredStateVersion";

/**
 * The color and icon of the label for each status of a desired state version.
 */
const statusLabelProps: Record<
  DesiredStateVersionStatus,
  Pick<LabelProps, "status" | "color" | "icon">
> = {
  [DesiredStateVersionStatus.active]: { status: "success" },
  [DesiredStateVersionStatus.skipped_candidate]: { status: "warning" },
  [DesiredStateVersionStatus.candidate]: { color: "blue", icon: <InfoAltIcon /> },
  [DesiredStateVersionStatus.retired]: {},
};

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
> = ({ status, children }) => (
  <Label variant="outline" {...statusLabelProps[status]}>
    {children ? (
      <>
        {status} {children}
      </>
    ) : (
      status
    )}
  </Label>
);
