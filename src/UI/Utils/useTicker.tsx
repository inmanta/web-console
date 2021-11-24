import { useEffect, useState } from "react";

const TWO_HOURS = 7200000;
const ONE_HOUR = 3600000;
const FIVE_MINUTES = 300000;
const ONE_MINUTE = 60000;
const TEN_SECONDS = 10000;
const FIVE_SECONDS = 5000;
const ONE_SECOND = 1000;

type Interval = "OneSecond" | "FiveSeconds" | "OneMinute" | "FiveMinutes";
type IntervalWithNever = Interval | "Never";

const getIntervalForDiff = (diff: number): IntervalWithNever => {
  if (diff > TWO_HOURS) return "Never";
  if (diff > ONE_HOUR) return "FiveMinutes";
  if (diff > FIVE_MINUTES) return "OneMinute";
  if (diff > TEN_SECONDS) return "FiveSeconds";
  return "OneSecond";
};

const intervalValueMap: Record<Interval, number> = {
  OneSecond: ONE_SECOND,
  FiveSeconds: FIVE_SECONDS,
  OneMinute: ONE_MINUTE,
  FiveMinutes: FIVE_MINUTES,
};

export const useTickerWithTimestamp = (timestamp: string): number => {
  const diff = Math.abs(Date.now() - new Date(timestamp).valueOf());
  const interval = getIntervalForDiff(diff);
  return useTickerWithInterval(interval);
};

export const useTickerWithInterval = (interval: IntervalWithNever): number => {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (interval === "Never") return;
    const timeout = setTimeout(() => {
      setNow(Date.now());
    }, intervalValueMap[interval]);
    return () => clearTimeout(timeout);
  }, [now, interval]);

  return now;
};
