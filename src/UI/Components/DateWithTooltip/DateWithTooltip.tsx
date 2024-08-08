import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { MomentDatePresenter, useTickerWithUnixMs } from "@/UI/Utils";

const datePresenter = new MomentDatePresenter();

interface Props {
  timestamp: string;
  className?: string;
}

export const DateWithTooltip: React.FC<Props> = ({ timestamp, className }) => {
  useTickerWithUnixMs(datePresenter.toUnixMs(timestamp));
  const date = datePresenter.get(timestamp);
  return (
    <Tooltip content={date.full} entryDelay={200}>
      <span className={className}>{date.relative}</span>
    </Tooltip>
  );
};
