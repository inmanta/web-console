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
import { reject } from "lodash";
import { words } from "@/UI/words";

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
    const withNewFrom = insertNewTimestamp(
      timestampFilters,
      from,
      Operator.From
    );
    const withNewTo = insertNewTimestamp(withNewFrom, to, Operator.To);
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

  const getChips = (timestampFilters: Raw[]): string[] => {
    return timestampFilters.map(rawToPretty);
  };

  const rawToPretty = ({ date, operator }: Raw): string => {
    return `${operator} | ${datePresenter.getShort(date)}`;
  };
  const prettyToRaw = (pretty: string): Raw => {
    const [operator, date] = pretty.split("|");
    return {
      date: datePresenter.parseShort(date),
      operator: operator.trim() as Operator,
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
  timestampFilters: Raw[],
  date: Date | undefined,
  operator: Operator
): Raw[] {
  if (date) {
    return [
      ...reject(timestampFilters, (ts) => ts.operator === operator),
      { date, operator },
    ];
  }
  return timestampFilters;
}
