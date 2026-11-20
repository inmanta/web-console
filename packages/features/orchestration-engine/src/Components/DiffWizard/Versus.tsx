import React from "react";
import { Flex, Icon, Label } from "@patternfly/react-core";
import { ArrowsAltHIcon } from "@patternfly/react-icons";
import { DiffSideLabels } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";

/**
 * The two sides of a comparison, as compact labels with an arrow between them.
 *
 * @props {DiffSideLabels} props - The component props
 *  @prop {string} fromLabel - The display text of the side the diff starts from
 *  @prop {string} toLabel - The display text of the side the diff goes to
 *
 * @returns {React.FC<DiffSideLabels>} The comparison
 */
export const Versus: React.FC<DiffSideLabels> = ({ fromLabel, toLabel }) => (
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
