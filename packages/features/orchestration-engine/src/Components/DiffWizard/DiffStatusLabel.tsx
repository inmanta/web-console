import React from "react";
import { Label } from "@patternfly/react-core";
import { Diff, words } from "@inmanta/web-console-core";
import { DIFF_STATUS_LABEL_COLORS } from "./types";

/**
 * The diff status of a resource as a colored label, named like its group in the resource list.
 *
 * @prop {Diff.Status} status - The diff status of the resource
 *
 * @returns {React.FC<{ status: Diff.Status }>} The status label
 */
export const DiffStatusLabel: React.FC<{ status: Diff.Status }> = ({ status }) => (
  <Label color={DIFF_STATUS_LABEL_COLORS[status]}>
    {words(`desiredState.compare.status.${status}`)}
  </Label>
);
