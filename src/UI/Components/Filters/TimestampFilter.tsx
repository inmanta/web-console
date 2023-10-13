import React, { useState } from "react";
import {
  Button,
  ToolbarFilter,
  ToolbarItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { reject } from "lodash-es";
import { DateRange, RangeOperator } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { TimestampPicker } from "./TimestampPicker";

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
      RangeOperator.Operator.From,
    );
    const withNewTo = insertNewTimestamp(
      withNewFrom,
      to,
      RangeOperator.Operator.To,
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
          element.operator == raw.operator,
      ),
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
    return `${operator} | ${datePresenter.getFull(date.toISOString())}`;
  };
  const prettyToRaw = (pretty: string): DateRange.Type => {
    const [operator, date] = pretty.split("|");
    return {
      date: datePresenter.parseFull(date),
      operator: operator.trim() as RangeOperator.Operator,
    };
  };

  return (
    <Flex
      style={{ gap: "var(--pf-v5-global--spacer--md)" }}
      flexWrap={{ lg: "nowrap" }}
    >
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
  operator: RangeOperator.Operator,
): DateRange.Type[] {
  if (date) {
    return [
      ...reject(timestampFilters, (ts) => ts.operator === operator),
      { date, operator },
    ];
  }
  return timestampFilters;
}
