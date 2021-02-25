import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { DateInfo } from "@/Core";

export const DateWithTooltip: React.FC<{ date: DateInfo }> = ({ date }) => (
  <Tooltip content={date.full} entryDelay={200}>
    <span>{date.relative}</span>
  </Tooltip>
);
