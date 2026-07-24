import React from "react";
import { BlinkingDot } from "@/Slices/Resource/UI/ResourcesPage/Components";
import { CustomDatePresenter } from "@/UI/Utils";

interface Props {
  started: string;
  finished: string | null;
}

const datePresenter = new CustomDatePresenter();

/**
 * Displays the duration of a resource action.
 *
 * For a finished action the fixed duration is shown. While an action is still
 * ongoing (no finish time yet, e.g. a deploy in progress) a pulsing blue dot is
 * shown, matching the deploying indication used on the resource page.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} started - The start time of the action.
 *  @prop {string | null} finished - The end time of the action, or null while ongoing.
 * @returns {React.FC<Props>} The duration component.
 */
export const Duration: React.FC<Props> = ({ started, finished }) => {
  if (!finished) {
    return <BlinkingDot $size={10} role="presentation" aria-label="DeployingIndication" />;
  }

  return <>{datePresenter.diff(finished, started)}</>;
};
