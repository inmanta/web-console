import React from "react";
import { Label, LabelProps, Tooltip } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  label: string;
  color?: LabelProps["color"];
  tooltip?: string;
}

/**
 * The collapsed face of a reference: an outline {@link Label} with the summary,
 * purple so it reads as neither status nor link, long labels ellipsized. The tooltip
 * is the design's "resolved at deploy time" hint; callers override the colour and
 * tooltip for unresolved or cyclic nodes.
 *
 * @prop {string} label - The summary text shown on the chip.
 * @prop {LabelProps["color"]} [color] - The label colour, defaulting to purple.
 * @prop {string} [tooltip] - The hover hint, defaulting to the deploy-time hint.
 *
 * @example <ReferenceChip label="std::Environment(name=NETBOX_API_TOKEN)" />
 */
export const ReferenceChip: React.FC<Props> = ({
  label,
  color = "purple",
  tooltip = words("references.chip.tooltip"),
}) => (
  <Tooltip content={tooltip}>
    <Label variant="outline" color={color}>
      <LabelText>{label}</LabelText>
    </Label>
  </Tooltip>
);

// A bound with ellipsis so a long summary neither wraps nor stretches the row.
// CSS ellipsis (not PF Truncate) because Truncate renders its own Tooltip, which
// would stack on top of the chip's Tooltip.
const LabelText = styled.span`
  display: inline-block;
  max-width: 40ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
`;
