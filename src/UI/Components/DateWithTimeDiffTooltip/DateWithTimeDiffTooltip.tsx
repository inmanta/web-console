import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { MomentDatePresenter, useTickerWithUnixMs } from "@/UI/Utils";
import { words } from "@/UI";

const datePresenter = new MomentDatePresenter();

interface Props {
  timestamp1: string;
  timestamp2: string;
}

export const DateWithTimeDiffTooltip: React.FC<Props> = ({
  timestamp1,
  timestamp2,
}) => {
  console.log(timestamp1)
  useTickerWithUnixMs(datePresenter.toUnixMs(timestamp1));
  const date = datePresenter.get(timestamp1);
  const dateDiff = datePresenter.diff(timestamp1, timestamp2);

  return (
    <Tooltip content={words("instanceDetails.events.dateTooltip")(dateDiff)} entryDelay={200}>
      <span>{date.dateTimeMilliseconds}</span>
    </Tooltip>
  );
};
