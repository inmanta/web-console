import React from "react";
import { Label } from "@patternfly/react-core";
import { Diff, words } from "@inmanta/web-console-core";
import { DIFF_STATUS_LABEL_COLORS } from "./types";

/**
 * The diff status of a resource as a compact colored label with one letter, like "M" for modified.
 *
 * @prop {Diff.Status} status - The diff status of the resource
 *
 * @returns {React.FC<{ status: Diff.Status }>} The status letter label
 */
export const DiffStatusLetterLabel: React.FC<{ status: Diff.Status }> = ({ status }) => (
  <Label isCompact color={DIFF_STATUS_LABEL_COLORS[status]}>
    {words(`desiredState.compare.statusLetter.${status}`)}
  </Label>
);
