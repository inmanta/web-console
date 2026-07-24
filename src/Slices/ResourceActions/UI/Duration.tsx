import React, { useEffect, useState } from "react";
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
 * ongoing (no finish time yet, e.g. a deploy in progress) the elapsed time
 * counts up once per second.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} started - The start time of the action.
 *  @prop {string | null} finished - The end time of the action, or null while ongoing.
 * @returns {React.FC<Props>} The duration component.
 */
export const Duration: React.FC<Props> = ({ started, finished }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (finished) {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(interval);
  }, [finished]);

  if (finished) {
    return <>{datePresenter.diff(finished, started)}</>;
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(started).getTime()) / 1000));

  return <>{`${elapsedSeconds} s`}</>;
};
