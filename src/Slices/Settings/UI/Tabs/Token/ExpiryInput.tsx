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

// Preset token lifetimes in seconds; the empty default means no explicit expiry.
const EXPIRY_OPTIONS: { seconds: number; label: string }[] = [
  { seconds: 3600, label: "1 hour" },
  { seconds: 86400, label: "1 day" },
  { seconds: 604800, label: "7 days" },
  { seconds: 2592000, label: "30 days" },
  { seconds: 31536000, label: "1 year" },
];

const CUSTOM_UNITS: { unit: string; seconds: number }[] = [
  { unit: "minutes", seconds: 60 },
  { unit: "hours", seconds: 3600 },
  { unit: "days", seconds: 86400 },
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
  const [choice, setChoice] = useState("");
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
    <FormGroup label={words("settings.tabs.token.expiry")} fieldId="token-expiry">
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
    </FormGroup>
  );
};

const AmountInput = styled(TextInput)`
  width: 6rem;
`;

const UnitSelect = styled(FormSelect)`
  width: auto;
`;
