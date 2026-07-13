import React, { useState } from "react";
import {
  Button,
  Checkbox,
  ExpandableSection,
  Flex,
  FlexItem,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  InputGroup,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { CodeIcon, KeyIcon, RobotIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { ClientType } from "@/Core";
import { AppAlert, ClipboardCopyButton, Description } from "@/UI/Components";
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

interface ExpiryInputProps {
  onChange(value: number | null): void;
  isDisabled: boolean;
}

/**
 * Expiry editor for the create-token form: preset lifetimes plus a custom amount + unit entry.
 * Emits the effective lifetime in seconds through onChange, or null when no (valid) expiry is set.
 */
const ExpiryInput: React.FC<ExpiryInputProps> = ({ onChange, isDisabled }) => {
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
    <>
      <FlexItem>
        <FormSelect
          id="token-expiry"
          aria-label="ExpiryOption"
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
    </>
  );
};

interface AdvancedSectionProps {
  toggleText: string;
  getClientTypeSelector(clientType: ClientType): (selected: boolean) => void;
  isClientTypeSelected(clientType: ClientType): boolean;
  isBusy: boolean;
}

/**
 * Collapsed-by-default section for the rarely-needed knobs: the client types embedded in the token.
 * Tokens are api-only by default; agent and compiler only matter for externally hosted agents and
 * remote compilers.
 */
const AdvancedSection: React.FC<AdvancedSectionProps> = ({
  toggleText,
  getClientTypeSelector,
  isClientTypeSelected,
  isBusy,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      toggleText={toggleText}
      isExpanded={isExpanded}
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
    >
      <AdvancedContent>
        <Title headingLevel="h3" size="md">
          {words("settings.tabs.token.clientTypes")}
        </Title>
        <ToggleGroup aria-label="ClientTypes">
          <ToggleGroupItem
            icon={<KeyIcon />}
            text="api"
            aria-label="ApiOption"
            isSelected={isClientTypeSelected("api")}
            onChange={(_event, selected) => getClientTypeSelector("api")(selected)}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<RobotIcon />}
            text="agent"
            aria-label="AgentOption"
            isSelected={isClientTypeSelected("agent")}
            onChange={(_event, selected) => getClientTypeSelector("agent")(selected)}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<CodeIcon />}
            text="compiler"
            aria-label="CompilerOption"
            isSelected={isClientTypeSelected("compiler")}
            onChange={(_event, selected) => getClientTypeSelector("compiler")(selected)}
            isDisabled={isBusy}
          />
        </ToggleGroup>
        <HelperText>
          <HelperTextItem>{words("settings.tabs.token.clientTypes.help")}</HelperTextItem>
        </HelperText>
      </AdvancedContent>
    </ExpandableSection>
  );
};

interface Props {
  onGenerate(): void;
  onErrorClose(): void;
  getClientTypeSelector(clientType: ClientType): (selected: boolean) => void;
  isClientTypeSelected(clientType: ClientType): boolean;
  isRevocable: boolean;
  onRevocableChange(value: boolean): void;
  onExpireChange(value: number | null): void;
  token: string | null;
  error: string | null;
  isBusy: boolean;
}

export const TokenForm: React.FC<Props> = ({
  onGenerate,
  getClientTypeSelector,
  isClientTypeSelected,
  isRevocable,
  onRevocableChange,
  onExpireChange,
  token,
  error,
  onErrorClose,
  isBusy,
}) => (
  <Container>
    <Description>{words("settings.tabs.token.description")}</Description>
    <PaddedFlex>
      <FlexItem>
        <label htmlFor="token-expiry">{words("settings.tabs.token.expiry")}</label>
      </FlexItem>
      {/* An idempotent (non-revocable) token carries no time-based claims, so it cannot expire. */}
      <ExpiryInput onChange={onExpireChange} isDisabled={isBusy || !isRevocable} />
      <FlexItem>
        <Checkbox
          id="token-revocable"
          label={words("settings.tabs.token.revocable")}
          aria-label="RevocableOption"
          isChecked={isRevocable}
          isDisabled={isBusy}
          onChange={(_event, checked) => onRevocableChange(checked)}
        />
      </FlexItem>
      <FlexItem>
        <Button variant="primary" onClick={onGenerate} isDisabled={isBusy}>
          {words("settings.tabs.token.generate")}
        </Button>
      </FlexItem>
    </PaddedFlex>
    <AdvancedSection
      toggleText={words("settings.tabs.token.advanced")}
      getClientTypeSelector={getClientTypeSelector}
      isClientTypeSelected={isClientTypeSelected}
      isBusy={isBusy}
    />
    <StyledInputGroup>
      <TextInput
        name="token"
        id="token"
        type="text"
        aria-label="TokenOutput"
        value={token ?? ""}
        readOnlyVariant="default"
      />
      <ClipboardCopyButton
        value={token ?? ""}
        isDisabled={token === null}
        variant="control"
        aria-label="CopyTokenToClipboard"
        style={{ alignItems: "center" }}
      />
    </StyledInputGroup>
    {error && (
      <AppAlert
        testId="ToastError"
        title={words("error")}
        onClose={onErrorClose}
        message={error}
        isInline
      />
    )}
  </Container>
);

const StyledInputGroup = styled(InputGroup)`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 600px;
`;

const AdvancedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
`;

const AmountInput = styled(TextInput)`
  width: 6rem;
`;

const UnitSelect = styled(FormSelect)`
  width: auto;
`;

const Container = styled.div`
  padding-top: 1rem;
`;

const PaddedFlex = styled(Flex)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;
