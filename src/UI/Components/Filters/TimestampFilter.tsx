import React, { useState } from "react";
import {
  Button,
  ToolbarFilter,
  ToolbarItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { DateRange } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";
import { TimestampPicker } from "./TimestampPicker";
import { SearchIcon } from "@patternfly/react-icons";
import { reject } from "lodash";
import { words } from "@/UI/words";

interface Props {
  datePresenter: DatePresenter;
  timestampFilters: DateRange.Type[];
  update: (timestampFilters: DateRange.Type[]) => void;
  isVisible: boolean;
}

export const TimestampFilter: React.FC<Props> = ({
  datePresenter,
  timestampFilters,
  update,
  isVisible,
}) => {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const onApply = () => {
    const withNewFrom = insertNewTimestamp(
      timestampFilters,
      from,
      DateRange.Operator.From
    );
    const withNewTo = insertNewTimestamp(
      withNewFrom,
      to,
      DateRange.Operator.To
    );
    update(withNewTo);
    setFrom(undefined);
    setTo(undefined);
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
  const onFromDateChange = (timestamp: Date) => {
    setFrom(timestamp);
  };

  const onToDateChange = (timestamp: Date) => {
    setTo(timestamp);
  };

  const getChips = (timestampFilters: DateRange.Type[]): string[] => {
    return timestampFilters.map(rawToPretty);
  };

  const rawToPretty = ({ date, operator }: DateRange.Type): string => {
    return `${operator} | ${datePresenter.getShort(date)}`;
  };
  const prettyToRaw = (pretty: string): DateRange.Type => {
    const [operator, date] = pretty.split("|");
    return {
      date: datePresenter.parseShort(date),
      operator: operator.trim() as DateRange.Operator,
    };
  };

  return (
    <Flex>
      {isVisible && (
        <>
          <FlexItem>
            <ToolbarItem>
              <TimestampPicker
                timestamp={from}
                onChange={onFromDateChange}
                from={undefined}
                datePickerLabel="From Date Picker"
                timePickerLabel="From Time Picker"
              />
            </ToolbarItem>
          </FlexItem>
          <FlexItem>
            <ToolbarItem>{words("events.filters.date.to")}</ToolbarItem>
          </FlexItem>
          <FlexItem>
            <ToolbarItem>
              <TimestampPicker
                timestamp={to}
                onChange={onToDateChange}
                from={from}
                datePickerLabel="To Date Picker"
                timePickerLabel="To Time Picker"
              />
            </ToolbarItem>
          </FlexItem>
        </>
      )}
      <FlexItem>
        <ToolbarFilter
          chips={getChips(timestampFilters)}
          deleteChip={removeChip}
          categoryName="Date"
          showToolbarItem={isVisible}
        >
          <Button
            onClick={onApply}
            isDisabled={!(from || to)}
            aria-label="Apply date filter"
            variant="tertiary"
          >
            <SearchIcon />
          </Button>
        </ToolbarFilter>
      </FlexItem>
    </Flex>
  );
};

function insertNewTimestamp(
  timestampFilters: DateRange.Type[],
  date: Date | undefined,
  operator: DateRange.Operator
): DateRange.Type[] {
  if (date) {
    return [
      ...reject(timestampFilters, (ts) => ts.operator === operator),
      { date, operator },
    ];
  }
  return timestampFilters;
}
