import React from "react";
import { CustomDatePresenter, useTickerWithInterval } from "@/UI/Utils";
import dayjs from "@/dayjs";
import { Timeline } from "./Timeline";

interface Props {
  requested: string;
  started?: string | null;
  completed?: string | null;
  success?: boolean | null;
}

const datePresenter = new CustomDatePresenter();

export const Provider: React.FC<Props> = ({ requested, started, completed, success }) => {
  useTickerWithInterval(!(started && completed) ? "OneSecond" : "Never");
  const now = new Date(Date.now()).toISOString();

  return (
    <Timeline
      requested={{
        day: datePresenter.getDate(requested),
        time: datePresenter.getTime(requested),
      }}
      requestedDiff={getDiff(started ? started : now, requested)}
      started={
        !started
          ? undefined
          : {
              day: datePresenter.getDate(started),
              time: datePresenter.getTime(started),
            }
      }
      startedDiff={!started ? undefined : getDiff(completed ? completed : now, started)}
      completed={
        !completed
          ? undefined
          : {
              day: datePresenter.getDate(completed),
              time: datePresenter.getTime(completed),
            }
      }
      success={success}
    />
  );
};

const getDiff = (timestampA: string, timestampB: string): string => {
  const seconds = dayjs.duration(dayjs.utc(timestampA).diff(dayjs.utc(timestampB))).asSeconds();
  const rounded = Math.round(seconds);

  return rounded === 1 ? "1 second" : `${rounded} seconds`;
};
