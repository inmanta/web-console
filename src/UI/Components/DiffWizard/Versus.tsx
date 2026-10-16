import React from "react";
import { Flex, Icon, Label } from "@patternfly/react-core";
import { ArrowsAltHIcon } from "@patternfly/react-icons";

/**
 * The display text of the two sides of a comparison, e.g. "current" and "v5".
 */
export interface VersusLabels {
  fromLabel: string;
  toLabel: string;
}

/**
 * The two sides of a comparison, as compact labels with an arrow between them.
 *
 * @props {VersusLabels} props - The component props
 *  @prop {string} fromLabel - The display text of the side the diff starts from
 *  @prop {string} toLabel - The display text of the side the diff goes to
 *
 * @returns {React.FC<VersusLabels>} The comparison
 */
export const Versus: React.FC<VersusLabels> = ({ fromLabel, toLabel }) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
    <Label isCompact variant="outline">
      {fromLabel}
    </Label>
    <Icon size="sm">
      <ArrowsAltHIcon />
    </Icon>
    <Label isCompact variant="outline">
      {toLabel}
    </Label>
  </Flex>
);
