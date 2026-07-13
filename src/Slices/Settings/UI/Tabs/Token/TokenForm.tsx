import React from "react";
import {
  Button,
  Checkbox,
  Flex,
  FlexItem,
  FormSelect,
  FormSelectOption,
  InputGroup,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { ClusterIcon, ProcessAutomationIcon, UserIcon } from "@patternfly/react-icons";
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

interface Props {
  onGenerate(): void;
  onErrorClose(): void;
  getClientTypeSelector(clientType: ClientType): (selected: boolean) => void;
  isClientTypeSelected(clientType: ClientType): boolean;
  isRevocable: boolean;
  onRevocableChange(value: boolean): void;
  expire: number | null;
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
  expire,
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
        <ToggleGroup aria-label="ClientTypes">
          <ToggleGroupItem
            icon={<UserIcon />}
            text="agent"
            aria-label="AgentOption"
            isSelected={isClientTypeSelected("agent")}
            onChange={(_event, selected) => getClientTypeSelector("agent")(selected)}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<ClusterIcon />}
            text="api"
            aria-label="ApiOption"
            isSelected={isClientTypeSelected("api")}
            onChange={(_event, selected) => getClientTypeSelector("api")(selected)}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<ProcessAutomationIcon />}
            text="compiler"
            aria-label="CompilerOption"
            isSelected={isClientTypeSelected("compiler")}
            onChange={(_event, selected) => getClientTypeSelector("compiler")(selected)}
            isDisabled={isBusy}
          />
        </ToggleGroup>
      </FlexItem>
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
        <label htmlFor="token-expiry">{words("settings.tabs.token.expiry")}</label>
      </FlexItem>
      <FlexItem>
        <FormSelect
          id="token-expiry"
          aria-label="ExpiryOption"
          value={expire === null ? "" : String(expire)}
          onChange={(_event, value) => onExpireChange(value === "" ? null : Number(value))}
          // An idempotent (non-revocable) token carries no time-based claims, so it cannot expire.
          isDisabled={isBusy || !isRevocable}
        >
          <FormSelectOption value="" label={words("settings.tabs.token.expiry.never")} />
          {EXPIRY_OPTIONS.map((option) => (
            <FormSelectOption
              key={option.seconds}
              value={String(option.seconds)}
              label={option.label}
            />
          ))}
        </FormSelect>
      </FlexItem>
      <FlexItem>
        <Button variant="primary" onClick={onGenerate} isDisabled={isBusy}>
          {words("settings.tabs.token.generate")}
        </Button>
      </FlexItem>
    </PaddedFlex>
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
  padding-bottom: 1rem;
  max-width: 600px;
`;

const Container = styled.div`
  padding-top: 1rem;
`;

const PaddedFlex = styled(Flex)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;
