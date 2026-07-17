import React, { useState } from "react";
import {
  Flex,
  FlexItem,
  FormGroup,
  FormSelect,
  FormSelectOption,
  InputGroup,
  TextInput,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

const ONE_MINUTE_SECONDS = 60;
const ONE_HOUR_SECONDS = 60 * ONE_MINUTE_SECONDS;
const ONE_DAY_SECONDS = 24 * ONE_HOUR_SECONDS;
const THIRTY_DAYS_SECONDS = 30 * ONE_DAY_SECONDS;
const ONE_YEAR_SECONDS = 365 * ONE_DAY_SECONDS;

// The default preselected lifetime for newly created tokens.
export const DEFAULT_EXPIRY_SECONDS = 7 * ONE_DAY_SECONDS;

// Preset token lifetimes in seconds; the empty option means no explicit expiry.
const EXPIRY_OPTIONS: { seconds: number; label: string }[] = [
  { seconds: ONE_HOUR_SECONDS, label: "1 hour" },
  { seconds: ONE_DAY_SECONDS, label: "1 day" },
  { seconds: DEFAULT_EXPIRY_SECONDS, label: "7 days" },
  { seconds: THIRTY_DAYS_SECONDS, label: "30 days" },
  { seconds: ONE_YEAR_SECONDS, label: "1 year" },
];

const CUSTOM_UNITS: { unit: string; seconds: number }[] = [
  { unit: "minutes", seconds: ONE_MINUTE_SECONDS },
  { unit: "hours", seconds: ONE_HOUR_SECONDS },
  { unit: "days", seconds: ONE_DAY_SECONDS },
];

interface Props {
  onChange(value: number | null): void;
  isDisabled: boolean;
}

/**
 * Labeled expiry editor for the create-token form: preset lifetimes plus a custom amount + unit entry.
 * Emits the effective lifetime in seconds through onChange, or null when no (valid) expiry is set.
 *
 * @returns {React.FC<Props>} The expiry input.
 */
export const ExpiryInput: React.FC<Props> = ({ onChange, isDisabled }) => {
  const [choice, setChoice] = useState(String(DEFAULT_EXPIRY_SECONDS));
  const [customAmount, setCustomAmount] = useState("");
  const [customUnit, setCustomUnit] = useState("days");

  const toSeconds = (choice: string, amount: string, unit: string): number | null => {
    if (choice === "") {
      return null;
    }

    if (choice !== "custom") {
      return Number(choice);
    }

    const parsed = Number(amount);
    const unitSeconds = CUSTOM_UNITS.find((option) => option.unit === unit)?.seconds;

    return Number.isInteger(parsed) && parsed > 0 && unitSeconds ? parsed * unitSeconds : null;
  };

  const update = (choice: string, amount: string, unit: string) => {
    setChoice(choice);
    setCustomAmount(amount);
    setCustomUnit(unit);
    onChange(toSeconds(choice, amount, unit));
  };

  return (
    <StyledFormGroup label={words("settings.tabs.token.expiry")} fieldId="token-expiry">
      <Flex gap={{ default: "gapSm" }} flexWrap={{ default: "nowrap" }}>
        <FlexItem>
          <FormSelect
            id="token-expiry"
            value={choice}
            onChange={(_event, value) => update(value, customAmount, customUnit)}
            isDisabled={isDisabled}
          >
            <FormSelectOption value="" label={words("settings.tabs.token.expiry.never")} />
            {EXPIRY_OPTIONS.map((option) => (
              <FormSelectOption
                key={option.seconds}
                value={String(option.seconds)}
                label={option.label}
              />
            ))}
            <FormSelectOption value="custom" label={words("settings.tabs.token.expiry.custom")} />
          </FormSelect>
        </FlexItem>
        {choice === "custom" && (
          <FlexItem>
            <InputGroup>
              <AmountInput
                id="token-expiry-amount"
                type="number"
                aria-label="ExpiryCustomAmount"
                value={customAmount}
                onChange={(_event, value) => update(choice, value, customUnit)}
                isDisabled={isDisabled}
              />
              <UnitSelect
                id="token-expiry-unit"
                aria-label="ExpiryCustomUnit"
                value={customUnit}
                onChange={(_event, value) => update(choice, customAmount, value)}
                isDisabled={isDisabled}
              >
                {CUSTOM_UNITS.map((option) => (
                  <FormSelectOption key={option.unit} value={option.unit} label={option.unit} />
                ))}
              </UnitSelect>
            </InputGroup>
          </FlexItem>
        )}
      </Flex>
    </StyledFormGroup>
  );
};

const AmountInput = styled(TextInput)`
  width: 6rem;
`;

const UnitSelect = styled(FormSelect)`
  width: auto;
`;

const StyledFormGroup = styled(FormGroup)`
  --pf-v6-c-form--m-horizontal__group-label--md--GridColumnWidth: 16rem;
`;
