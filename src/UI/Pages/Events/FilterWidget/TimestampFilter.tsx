import React, { useState } from "react";
import { ToolbarFilter, ToolbarItem } from "@patternfly/react-core";
import { reject } from "lodash";
import { OperatorPicker } from "./OperatorPicker";
import { TimestampPicker } from "./TimestampPicker";
import { Operator } from "@/Core";
import { DatePresenter } from "../../ServiceInventory/Presenters";

interface Raw {
  date: Date;
  operator: Operator;
}

interface Props {
  datePresenter: DatePresenter;
  timestampFilters: Raw[];
  update: (timestampFilters: Raw[]) => void;
  isVisible: boolean;
}

export const TimestampFilter: React.FC<Props> = ({
  datePresenter,
  timestampFilters,
  update,
  isVisible,
}) => {
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

  const rawToPretty = ({ date, operator }: Raw): string => {
    return `${datePresenter.getShort(date)} | ${operator}`;
  };

  const prettyToRaw = (pretty: string): Raw => {
    const [date, operator] = pretty.split("|");
    return {
      date: datePresenter.parseShort(date),
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
