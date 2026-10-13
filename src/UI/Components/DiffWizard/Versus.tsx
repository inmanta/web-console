import React from "react";
import { Flex, Icon, Label } from "@patternfly/react-core";
import { ArrowsAltHIcon } from "@patternfly/react-icons";
import { Diff } from "@/Core";

/**
 * The two sides of a comparison, as compact labels with an arrow between them.
 *
 * @props {Diff.Identifiers} props - The component props
 *  @prop {string} from - The side the diff starts from
 *  @prop {string} to - The side the diff goes to
 *
 * @returns {React.FC<Diff.Identifiers>} The comparison
 */
export const Versus: React.FC<Diff.Identifiers> = ({ from, to }) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
    <Label isCompact variant="outline">
      {from}
    </Label>
    <Icon size="sm">
      <ArrowsAltHIcon />
    </Icon>
    <Label isCompact variant="outline">
      {to}
    </Label>
  </Flex>
);
