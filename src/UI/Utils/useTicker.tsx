import { useEffect, useState } from "react";

// These values are in milliseconds
const ONE_HOUR = 3600000;
const ONE_MINUTE = 60000;
const TEN_SECONDS = 10000;
const ONE_SECOND = 1000;

type Interval = "OneSecond" | "TenSeconds" | "OneMinute";
type IntervalWithNever = Interval | "Never";

const getIntervalForDiff = (diff: number): IntervalWithNever => {
  if (diff > ONE_HOUR) return "OneMinute";
  if (diff > ONE_MINUTE) return "TenSeconds";
  return "OneSecond";
};

const intervalValueMap: Record<Interval, number> = {
  OneSecond: ONE_SECOND,
  TenSeconds: TEN_SECONDS,
  OneMinute: ONE_MINUTE,
};

/**
 * @param timestamp the timestamp in UTC timezone without trailing 'Z'
 * @param customNow a custom Date.now() value for testing
 * @returns the difference in milliseconds between now and the timestamp
 */
export const getDiffFromNow = (
  timestamp: string,
  customNow?: number
): number => {
  const now = customNow || Date.now();
  const timestampWithZone = timestamp.split("Z")[0] + "Z";
  const timestampMs = new Date(timestampWithZone).valueOf();
  const diff = Math.abs(now - timestampMs);
  return diff;
};

export const useTickerWithTimestamp = (timestamp: string): number => {
  const diff = getDiffFromNow(timestamp);
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
