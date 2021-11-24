import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { MomentDatePresenter, useTickerWithTimestamp } from "@/UI/Utils";

const datePresenter = new MomentDatePresenter();

export const DateWithTooltip: React.FC<{ timestamp: string }> = ({
  timestamp,
}) => {
  useTickerWithTimestamp(timestamp);
  const date = datePresenter.get(timestamp);
  return (
    <Tooltip content={date.full} entryDelay={200}>
      <span>{date.relative}</span>
    </Tooltip>
  );
};
