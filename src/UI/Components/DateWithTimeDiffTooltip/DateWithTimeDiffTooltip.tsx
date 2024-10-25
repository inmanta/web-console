import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { MomentDatePresenter, useTickerWithUnixMs } from "@/UI/Utils";

const datePresenter = new MomentDatePresenter();

interface Props {
  timestamp1: string;
  timestamp2: string;
}

export const DateWithTimeDiffTooltip: React.FC<Props> = ({
  timestamp1,
  timestamp2,
}) => {
  useTickerWithUnixMs(datePresenter.toUnixMs(timestamp1));
  const date = datePresenter.get(timestamp1);
  const dateDiff = datePresenter.diff(timestamp1, timestamp2);

  return (
    <Tooltip content={dateDiff} entryDelay={200}>
      <span>{date.full} since last event.</span>
    </Tooltip>
  );
};
