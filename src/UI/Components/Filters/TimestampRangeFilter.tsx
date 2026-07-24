import React, { useState } from "react";
import { Button, Flex, FlexItem, FormGroup } from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { DateRange, RangeOperator } from "@/Core";
import { words } from "@/UI/words";
import { TimestampPicker } from "./TimestampPicker";

interface Props {
  label: string;
  fromLabel: string;
  toLabel: string;
  value: DateRange.Type[];
  onChange: (value: DateRange.Type[]) => void;
}

/**
 * The TimestampRangeFilter component.
 *
 * A drawer-friendly "from / to" date-range filter input. Composes two TimestampPickers,
 * each with its own Apply button that commits that end of the range independently. Applying a
 * value replaces any existing entry for the same operator in the current value and emits the
 * full updated range via onChange; it does not render chips (the drawer surfaces those in its
 * active-filters section).
 *
 * @Props {Props} - Component props.
 *  @prop {string} label - Label for the outer form group (the range category).
 *  @prop {string} fromLabel - Label for the "from" input.
 *  @prop {string} toLabel - Label for the "to" input.
 *  @prop {DateRange.Type[]} value - The currently committed range entries.
 *  @prop {(value: DateRange.Type[]) => void} onChange - Callback with the updated range when a from/to value is applied.
 *
 * @returns {React.ReactElement} The rendered date-range filter input.
 */
export const TimestampRangeFilter: React.FC<Props> = ({
  label,
  fromLabel,
  toLabel,
  value,
  onChange,
}) => {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const applyRangeValue = (date: Date, operator: RangeOperator.Operator) => {
    onChange([...value.filter((entry) => entry.operator !== operator), { date, operator }]);
  };

  const applyFrom = () => {
    if (!from) {
      return;
    }
    applyRangeValue(from, RangeOperator.Operator.From);
    setFrom(undefined);
  };

  const applyTo = () => {
    if (!to) {
      return;
    }
    applyRangeValue(to, RangeOperator.Operator.To);
    setTo(undefined);
  };

  return (
    <FormGroup label={label}>
      <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
        <FlexItem>
          <FormGroup label={fromLabel}>
            <TimestampPicker
              timestamp={from}
              onChange={setFrom}
              from={undefined}
              datePickerLabel={words("filters.timestamp.from.datePicker")}
              timePickerLabel={words("filters.timestamp.from.timePicker")}
              action={
                <Button
                  variant="control"
                  onClick={applyFrom}
                  isDisabled={!from}
                  aria-label={words("filters.timestamp.from.apply")}
                >
                  <PlusIcon />
                </Button>
              }
            />
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <FormGroup label={toLabel}>
            <TimestampPicker
              timestamp={to}
              onChange={setTo}
              from={from}
              datePickerLabel={words("filters.timestamp.to.datePicker")}
              timePickerLabel={words("filters.timestamp.to.timePicker")}
              action={
                <Button
                  variant="control"
                  onClick={applyTo}
                  isDisabled={!to}
                  aria-label={words("filters.timestamp.to.apply")}
                >
                  <PlusIcon />
                </Button>
              }
            />
          </FormGroup>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};
