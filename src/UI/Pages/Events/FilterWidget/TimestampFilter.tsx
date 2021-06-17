import React, { useState } from "react";
import {
  Button,
  ToolbarFilter,
  ToolbarItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { Operator } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";
import { TimestampPicker } from "./TimestampPicker";
import { SearchIcon } from "@patternfly/react-icons";

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
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const onApply = () => {
    if (from && to) {
      update([
        {
          date: from,
          operator: Operator.From,
        },
        {
          date: to,
          operator: Operator.To,
        },
      ]);
    }
  };

  const removeChip = () => {
    update([]);
  };
  const onFromDateChange = (timestamp: Date) => {
    setFrom(timestamp);
  };

  const onToDateChange = (timestamp: Date) => {
    setTo(timestamp);
  };

  const getChips = (timestampFilters: Raw[]): string[] => {
    if (timestampFilters.length === 2) {
      const [fromTimestamp, toTimestamp] = timestampFilters;
      return [rawToPretty(fromTimestamp, toTimestamp)];
    }
    return [];
  };

  const rawToPretty = (
    { date: fromDate, operator: fromOperator }: Raw,
    { date: toDate, operator: toOperator }: Raw
  ): string => {
    return `${fromOperator} ${datePresenter.getShort(
      fromDate
    )} ${toOperator} ${datePresenter.getShort(toDate)}`;
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
            <ToolbarItem>to</ToolbarItem>
          </FlexItem>
          <FlexItem>
            <ToolbarItem>
              <TimestampPicker
                timestamp={to}
                onChange={onToDateChange}
                isDisabled={!from}
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
            isDisabled={!(from && to)}
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
