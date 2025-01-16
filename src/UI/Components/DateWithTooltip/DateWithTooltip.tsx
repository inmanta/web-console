import React, { useRef } from "react";
import { Tooltip } from "@patternfly/react-core";
import { MomentDatePresenter, useTickerWithUnixMs } from "@/UI/Utils";

const datePresenter = new MomentDatePresenter();

interface Props {
  timestamp: string;
  isFull?: boolean;
  className?: string;
}

/**
 * The DateWithTooltip component
 *
 * Date display that can either be relative or full.
 * Relative will show how long ago the timestamp was.
 * Full will display the date in the format YYYY/MM/DD HH:MM:SS
 *
 * Depending on the displayed value, the tooltip will show the full timestamp or the relative one.
 *
 * @props {Props} - The props of the component
 *  @prop {string} timestamp - the timestamp to display with tooltip.
 *  @prop {boolean} [isFull] - optional boolean to display the full date instead of the default relative one.
 *  @prop {string} [classname] - optional class to style the date span.
 * @returns A component displaying the date in full, or relative, with tooltip.
 */
export const DateWithTooltip: React.FC<Props> = ({
  timestamp,
  isFull,
  className,
}) => {
  useTickerWithUnixMs(datePresenter.toUnixMs(timestamp));
  const date = datePresenter.get(timestamp);
  return (
    <Tooltip
      content={isFull ? date.relative : date.full}
      entryDelay={200}
      appendTo={() =>
        document.getElementById("tooltip-boundary") as HTMLElement
      }
      flipBehavior={["top", "bottom"]}
    >
      <span className={className}>{isFull ? date.full : date.relative}</span>
    </Tooltip>
  );
};
