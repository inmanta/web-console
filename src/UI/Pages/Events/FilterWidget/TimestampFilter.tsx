import React, { useContext, useState } from "react";
import { ToolbarFilter, ToolbarItem } from "@patternfly/react-core";
import { reject } from "lodash";
import { OperatorPicker } from "./OperatorPicker";
import { TimestampPicker } from "./TimestampPicker";
import moment from "moment";
import { Operator } from "@/Core";
import { TimezoneContext } from "@/UI/Dependency";

interface Raw {
  date: Date;
  operator: Operator;
}

interface Props {
  timestampFilters: Raw[];
  update: (timestampFilters: Raw[]) => void;
  isVisible: boolean;
}

export const TimestampFilter: React.FC<Props> = ({
  timestampFilters,
  update,
  isVisible,
}) => {
  const timezone = useContext(TimezoneContext);
  const [timestampFilter, setTimestampFilter] =
    useState<Date | undefined>(undefined);

  const onOperatorChange = (rule: Operator) => {
    if (typeof timestampFilter === "undefined") return;

    setTimestampFilter(undefined);
    update(
      createNewTimestamps(timestampFilters, {
        date: timestampFilter,
        operator: Operator[rule],
      })
    );
  };

  const removeChip = (category, value) => {
    const raw = prettyToRaw(value);
    update(
      reject(
        timestampFilters,
        (element) =>
          element.date.getTime() === raw.date.getTime() &&
          element.operator == raw.operator
      )
    );
  };

  const onTimestampChange = (timestamp: Date) => {
    setTimestampFilter(timestamp);
  };

  const getChips = (timestampFilters: Raw[]): string[] => {
    const prettyTimestamps = timestampFilters.map(rawToPretty);
    return prettyTimestamps;
  };

  const rawToPretty = ({ date, operator: rule }: Raw): string => {
    return `${moment
      .tz(date, timezone)
      .format("YYYY-MM-DD+HH:mm z")} | ${rule}`;
  };

  const prettyToRaw = (pretty: string): Raw => {
    const [date, operator] = pretty.split("|");
    return {
      date: moment.tz(date, "YYYY-MM-DD+HH:mm z", timezone).toDate(),
      operator: operator.trim() as Operator,
    };
  };

  return (
    <>
      {isVisible && (
        <ToolbarItem>
          <TimestampPicker
            timestamp={timestampFilter}
            onChange={onTimestampChange}
          />
        </ToolbarItem>
      )}
      <ToolbarFilter
        chips={getChips(timestampFilters)}
        deleteChip={removeChip}
        categoryName="Date"
        showToolbarItem={isVisible}
      >
        <OperatorPicker
          onChange={onOperatorChange}
          isDisabled={typeof timestampFilter === "undefined"}
        />
      </ToolbarFilter>
    </>
  );
};

function createNewTimestamps(
  timestampFilters: Raw[],
  newTimestamp: Raw
): Raw[] {
  if (timestampFilters.includes(newTimestamp)) {
    return reject(
      timestampFilters,
      (element) =>
        element.date.getTime() === newTimestamp.date.getTime() &&
        element.operator == newTimestamp.operator
    );
  } else {
    return [...timestampFilters, newTimestamp];
  }
}
