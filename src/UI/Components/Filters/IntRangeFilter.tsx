import React, { useState } from "react";
import {
  Button,
  Flex,
  FlexItem,
  TextInput,
  ToolbarFilter,
  ToolbarItem,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { reject } from "lodash-es";
import { IntRange, RangeOperator } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  categoryName: string;
  intRangeFilters: IntRange.Type[];
  update: (intRangeFilters: IntRange.Type[]) => void;
  isVisible: boolean;
}

export const IntRangeFilter: React.FC<Props> = ({
  intRangeFilters,
  update,
  isVisible,
  categoryName,
}) => {
  const [from, setFrom] = useState<number | undefined>();
  const [to, setTo] = useState<number | undefined>();

  const onApply = () => {
    const withNewFrom = insertNewValue(
      intRangeFilters,
      from,
      RangeOperator.Operator.From,
    );
    const withNewTo = insertNewValue(
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
        intRangeFilters,
        (element) =>
          element.value === raw.value && element.operator == raw.operator,
      ),
    );
  };
  const onFromChange = (value: string) => {
    setFrom(parseInt(value, 10));
  };

  const onToChange = (value: string) => {
    setTo(parseInt(value, 10));
  };

  const getChips = (intRangeFilters: IntRange.Type[]): string[] => {
    return intRangeFilters.map(rawToPretty);
  };

  const rawToPretty = ({ value, operator }: IntRange.Type): string => {
    return `${operator} | ${value}`;
  };
  const prettyToRaw = (pretty: string): IntRange.Type => {
    const [operator, value] = pretty.split("|");
    return {
      value: parseInt(value, 10),
      operator: operator.trim() as RangeOperator.Operator,
    };
  };
  return (
    <>
      <Flex>
        {isVisible && (
          <>
            <FlexItem>
              <ToolbarItem>
                <TextInput
                  value={from || ""}
                  onChange={onFromChange}
                  type="number"
                  aria-label={`${categoryName} range from`}
                />
              </ToolbarItem>
            </FlexItem>
            <FlexItem>
              <ToolbarItem>{words("events.filters.date.to")}</ToolbarItem>
            </FlexItem>
            <FlexItem>
              <ToolbarItem>
                <TextInput
                  value={to || ""}
                  onChange={onToChange}
                  type="number"
                  aria-label={`${categoryName} range to`}
                />
              </ToolbarItem>
            </FlexItem>
          </>
        )}
        <FlexItem>
          <ToolbarFilter
            chips={getChips(intRangeFilters)}
            deleteChip={removeChip}
            categoryName={categoryName}
            showToolbarItem={isVisible}
          >
            <Button
              onClick={onApply}
              isDisabled={!(from || to)}
              aria-label={`Apply ${categoryName} filter`}
              variant="tertiary"
            >
              <SearchIcon />
            </Button>
          </ToolbarFilter>
        </FlexItem>
      </Flex>
    </>
  );
};

function insertNewValue(
  intRangeFilters: IntRange.Type[],
  value: number | undefined,
  operator: RangeOperator.Operator,
): IntRange.Type[] {
  if (value !== undefined) {
    return [
      ...reject(intRangeFilters, (ts) => ts.operator === operator),
      { value, operator },
    ];
  }
  return intRangeFilters;
}
