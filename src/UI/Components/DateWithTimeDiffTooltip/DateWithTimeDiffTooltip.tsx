import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { words } from "@/UI";
import { MomentDatePresenter, useTickerWithUnixMs } from "@/UI/Utils";

const datePresenter = new MomentDatePresenter();

interface Props {
  timestamp1: string;
  timestamp2: string;
}

/**
 * DateWithTimeDiffTooltip Component
 *
 * Displays a Timestamp with a tooltip showing the time difference between two timestamps in milliseconds.
 * The timestamp is displayed to the third second fraction.
 *
 * @Note Moment will round any further fraction.
 * We are getting the timestamps to the fourth fraction from the API, but we can't display them with the current Moment library.
 *
 * @prop {Props} props - The Props of the DateWitTimeDiffTooltip
 *  @prop {string} timestamp1 - The first timestamp that needs to be compared with.
 *  @prop {string} timestamp2 - The second timestamp that needs to be compared against.
 *
 * @returns A DateWithTimeDiffTooltip Component.
 */
export const DateWithTimeDiffTooltip: React.FC<Props> = ({ timestamp1, timestamp2 }) => {
  useTickerWithUnixMs(datePresenter.toUnixMs(timestamp1));
  const date = datePresenter.get(timestamp1);
  const dateDiff = datePresenter.diff(timestamp1, timestamp2);

  return (
    <Tooltip content={words("instanceDetails.events.dateTooltip")(dateDiff)} entryDelay={200}>
      <span>{date.dateTimeMilliseconds}</span>
    </Tooltip>
  );
};
