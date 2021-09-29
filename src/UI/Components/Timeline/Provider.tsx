import React from "react";
import moment from "moment";
import { Timeline } from "./Timeline";

interface Props {
  requested: string;
  started?: string;
  completed?: string;
}

export const Provider: React.FC<Props> = ({
  requested,
  started,
  completed,
}) => {
  const now = new Date(Date.now()).toISOString();
  return (
    <Timeline
      requested={{ day: getDay(requested), time: getTime(requested) }}
      requestedDiff={getDiff(requested, started ? started : now)}
      started={
        !started ? undefined : { day: getDay(started), time: getTime(started) }
      }
      startedDiff={
        !started ? undefined : getDiff(started, completed ? completed : now)
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
  moment.tz(timestamp, moment.tz.guess()).format("DD/MM/YYYY");

const getTime = (timestamp: string): string =>
  moment.tz(timestamp, moment.tz.guess()).format("HH:mm:ss.SSS");

const getDiff = (timestampA: string, timestampB: string): string =>
  moment.duration(moment(timestampA).diff(timestampB)).humanize({ ss: 4 });
