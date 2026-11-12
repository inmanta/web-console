import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { StateCountsTooltipRow } from "./types";

interface Props {
  title: string;
  rows: StateCountsTooltipRow[];
}

/**
 * The tooltip content of a status label: a title, then one row per counted state with its name
 * and instance count.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} title - The title above the rows.
 *  @prop {StateCountsTooltipRow[]} rows - The counted states and their instance counts.
 *
 * @returns {React.FC<Props>} The tooltip content.
 */
export const StateCountsTooltipContent: React.FC<Props> = ({ title, rows }) => (
  <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
    <FlexItem>{title}</FlexItem>
    {rows.map(({ key, displayName, count }) => (
      <Flex
        key={key}
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        flexWrap={{ default: "nowrap" }}
        gap={{ default: "gapMd" }}
      >
        <FlexItem>{displayName}</FlexItem>
        <FlexItem>{count}</FlexItem>
      </Flex>
    ))}
  </Flex>
);
