import React from "react";
import moment from "moment";
import { MomentDatePresenter, useTickerWithInterval } from "@/UI/Utils";
import { Timeline } from "./Timeline";

interface Props {
  requested: string;
  started?: string | null;
  completed?: string | null;
}

const datePresenter = new MomentDatePresenter();

export const Provider: React.FC<Props> = ({
  requested,
  started,
  completed,
}) => {
  useTickerWithInterval(!(started && completed) ? "OneSecond" : "Never");
  const now = new Date(Date.now()).toISOString();
  return (
    <Timeline
      requested={{
        day: datePresenter.getDay(requested),
        time: datePresenter.getTime(requested),
      }}
      requestedDiff={getDiff(started ? started : now, requested)}
      started={
        !started
          ? undefined
          : {
              day: datePresenter.getDay(started),
              time: datePresenter.getTime(started),
            }
      }
      startedDiff={
        !started ? undefined : getDiff(completed ? completed : now, started)
      }
      completed={
        !completed
          ? undefined
          : {
              day: datePresenter.getDay(completed),
              time: datePresenter.getTime(completed),
            }
      }
    />
  );
};

const getDiff = (timestampA: string, timestampB: string): string => {
  const seconds = moment
    .duration(moment.utc(timestampA).diff(moment.utc(timestampB)))
    .asSeconds();
  const rounded = Math.round(seconds);
  return rounded === 1 ? `1 second` : `${rounded} seconds`;
};
