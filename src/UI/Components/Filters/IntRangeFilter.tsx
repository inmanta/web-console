import React, { useState } from "react";
import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  InputGroup,
  InputGroupItem,
  TextInput,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { IntRange, RangeOperator } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  label: string;
  fromLabel: string;
  toLabel: string;
  value: IntRange.Type[];
  onChange: (value: IntRange.Type[]) => void;
}

/**
 * The IntRangeFilter component.
 *
 * The integer sibling of TimestampRangeFilter: a drawer-friendly "from / to" numeric-range
 * input. It owns the two number inputs and their local state, parses/validates the entered
 * value, and on apply replaces any existing entry for that operator in the current value,
 * emitting the full updated range via onChange. It renders no chips (the drawer surfaces
 * those in its active-filters section). Input and button aria-labels are derived from label,
 * e.g. label "Version" gives "Version range from" and "Apply Version from filter".
 *
 * @Props {Props} - Component props.
 *  @prop {string} label - Label for the outer form group (the range category).
 *  @prop {string} fromLabel - Label for the "from" input.
 *  @prop {string} toLabel - Label for the "to" input.
 *  @prop {IntRange.Type[]} value - The currently committed range entries.
 *  @prop {(value: IntRange.Type[]) => void} onChange - Callback with the updated range when a from/to value is applied.
 *
 * @returns {React.ReactElement} The rendered integer-range filter input.
 */
export const IntRangeFilter: React.FC<Props> = ({ label, fromLabel, toLabel, value, onChange }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const applyRangeValue = (raw: string, operator: RangeOperator.Operator, reset: () => void) => {
    const parsed = raw !== "" ? parseInt(raw, 10) : undefined;

    if (parsed === undefined || isNaN(parsed)) {
      return;
    }
    onChange([
      ...value.filter((entry) => entry.operator !== operator),
      { value: parsed, operator },
    ]);
    reset();
  };

  const applyFrom = () => {
    if (!from) {
      return;
    }
    applyRangeValue(from, RangeOperator.Operator.From, () => setFrom(""));
  };
  const applyTo = () => {
    if (!to) {
      return;
    }
    applyRangeValue(to, RangeOperator.Operator.To, () => setTo(""));
  };

  const onEnter = (apply: () => void) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      apply();
    }
  };

  return (
    <FormGroup label={label}>
      <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
        <FlexItem>
          <FormGroup label={fromLabel}>
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  value={from}
                  onChange={(_e, val) => setFrom(val)}
                  type="number"
                  placeholder={fromLabel}
                  aria-label={words("filters.range.from.input")(label)}
                  onKeyDown={onEnter(applyFrom)}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Button
                  variant="control"
                  onClick={applyFrom}
                  isDisabled={!from}
                  aria-label={words("filters.range.from.apply")(label)}
                >
                  <PlusIcon />
                </Button>
              </InputGroupItem>
            </InputGroup>
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <FormGroup label={toLabel}>
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  value={to}
                  onChange={(_e, val) => setTo(val)}
                  type="number"
                  placeholder={toLabel}
                  aria-label={words("filters.range.to.input")(label)}
                  onKeyDown={onEnter(applyTo)}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Button
                  variant="control"
                  onClick={applyTo}
                  isDisabled={!to}
                  aria-label={words("filters.range.to.apply")(label)}
                >
                  <PlusIcon />
                </Button>
              </InputGroupItem>
            </InputGroup>
          </FormGroup>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};
