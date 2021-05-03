import React, { useState } from "react";
import { ToolbarFilter, ToolbarItem } from "@patternfly/react-core";
import { reject } from "lodash";
import { OperatorPicker } from "./OperatorPicker";
import { TimestampPicker } from "./TimestampPicker";
import moment from "moment";
import { Operator } from "@/Core";

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
  const [timestampFilter, setTimestampFilter] = useState<Date | undefined>(
    undefined
  );

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

function getChips(timestampFilters: Raw[]): string[] {
  const prettyTimestamps = timestampFilters.map(rawToPretty);
  return prettyTimestamps;
}

function rawToPretty({ date, operator: rule }: Raw): string {
  return `${moment(date).format("YYYY-MM-DD+HH:mm")} | ${rule}`;
}

function prettyToRaw(pretty: string): Raw {
  const [date, operator] = pretty.split("|");
  return {
    date: moment(date, "YYYY-MM-DD+HH:mm").toDate(),
    operator: operator.trim() as Operator,
  };
}
