import React, { useEffect, useState } from "react";
import { Flex, FlexItem, FormGroup, FormSelect, FormSelectOption } from "@patternfly/react-core";
import styled from "styled-components";
import { resolveUnitConfig, UnitFormInput } from "@/UI/Components/UnitInput";
import { words } from "@/UI/words";

const ONE_HOUR_SECONDS = 60 * 60;
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

// Custom-entry unit config: a plain duration in seconds, displayed in days by default.
const CUSTOM_CONFIG_RESULT = resolveUnitConfig({ web_unit: "s", web_unit_display: "d" }, "int");

if (!CUSTOM_CONFIG_RESULT.ok) {
  throw new Error(CUSTOM_CONFIG_RESULT.reason);
}

const CUSTOM_CONFIG = CUSTOM_CONFIG_RESULT.config;

interface Props {
  onChange(value: number | null): void;
  onValidityChange(isValid: boolean): void;
  isDisabled: boolean;
}

/**
 * Labeled expiry editor for the create-token form: preset lifetimes plus a custom amount + unit entry.
 * Emits the effective lifetime in seconds through onChange, or null when no (valid) expiry is set.
 * Reports through onValidityChange whether the custom entry currently has a validation error, so
 * the caller can gate submission on it — a blank custom entry is valid (it just means "never").
 *
 * @returns {React.FC<Props>} The expiry input.
 */
export const ExpiryInput: React.FC<Props> = ({ onChange, onValidityChange, isDisabled }) => {
  const [choice, setChoice] = useState(String(DEFAULT_EXPIRY_SECONDS));
  const [customValue, setCustomValue] = useState<number | bigint | null>(null);
  const [isCustomValid, setIsCustomValid] = useState(true);

  const isValid = choice !== "custom" || isCustomValid;

  useEffect(() => {
    onValidityChange(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid]);

  const selectPreset = (value: string) => {
    setChoice(value);
    onChange(value === "" || value === "custom" ? null : Number(value));
  };

  const selectCustom = (value: number | bigint | null) => {
    setCustomValue(value);
    onChange(value === null ? null : Number(value));
  };

  return (
    <StyledFormGroup label={words("settings.tabs.token.expiry")} fieldId="token-expiry">
      <Flex gap={{ default: "gapSm" }} flexWrap={{ default: "nowrap" }}>
        <FlexItem>
          <FormSelect
            id="token-expiry"
            value={choice}
            onChange={(_event, value) => selectPreset(value)}
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
          <UnlabeledFlexItem>
            <UnitFormInput
              attributeName="token-expiry-custom"
              label=""
              attributeValue={customValue}
              isOptional
              config={CUSTOM_CONFIG}
              bounds={{ gt: 0 }}
              shouldBeDisabled={isDisabled}
              handleInputChange={(value) => selectCustom(value)}
              onValidityChange={setIsCustomValid}
            />
          </UnlabeledFlexItem>
        )}
      </Flex>
    </StyledFormGroup>
  );
};

const StyledFormGroup = styled(FormGroup)`
  --pf-v6-c-form--m-horizontal__group-label--md--GridColumnWidth: 16rem;
`;

// UnitFormInput renders its own (unused, label="") FormGroup, which otherwise inherits the
// horizontal-form label-column width above and reserves that as blank space before its control.
const UnlabeledFlexItem = styled(FlexItem)`
  --pf-v6-c-form--m-horizontal__group-label--md--GridColumnWidth: 0px;
`;
