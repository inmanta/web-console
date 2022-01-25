import React from "react";
import moment from "moment";
import { useTickerWithInterval } from "@/UI/Utils";
import { Timeline } from "./Timeline";

interface Props {
  requested: string;
  started?: string | null;
  completed?: string | null;
}

export const Provider: React.FC<Props> = ({
  requested,
  started,
  completed,
}) => {
  useTickerWithInterval(!(started && completed) ? "OneSecond" : "Never");
  const now = new Date(Date.now()).toISOString();
  return (
    <Timeline
      requested={{ day: getDay(requested), time: getTime(requested) }}
      requestedDiff={getDiff(started ? started : now, requested)}
      started={
        !started ? undefined : { day: getDay(started), time: getTime(started) }
      }
      startedDiff={
        !started ? undefined : getDiff(completed ? completed : now, started)
      }
      completed={
        !completed
          ? undefined
          : { day: getDay(completed), time: getTime(completed) }
      }
    />
  );
};

const getDay = (timestamp: string): string =>
  moment.utc(timestamp).tz(moment.tz.guess()).format("DD/MM/YYYY");

const getTime = (timestamp: string): string =>
  moment.utc(timestamp).tz(moment.tz.guess()).format("HH:mm:ss.SSS");

const getDiff = (timestampA: string, timestampB: string): string => {
  const seconds = moment
    .duration(moment.utc(timestampA).diff(moment.utc(timestampB)))
    .asSeconds();
  const rounded = Math.round(seconds);
  return rounded === 1 ? `1 second` : `${rounded} seconds`;
};
