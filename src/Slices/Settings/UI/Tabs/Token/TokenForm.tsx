import React, { useState } from "react";
import {
  Button,
  Checkbox,
  ExpandableSection,
  Flex,
  FlexItem,
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
import { ExpiryInput } from "./ExpiryInput";

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
      <Flex
        direction={{ default: "column" }}
        alignItems={{ default: "alignItemsFlexStart" }}
        gap={{ default: "gapSm" }}
      >
        <FlexItem>
          <Title headingLevel="h3" size="md">
            {words("settings.tabs.token.clientTypes")}
          </Title>
        </FlexItem>
        <FlexItem>
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
        </FlexItem>
        <FlexItem>
          <HelperText>
            <HelperTextItem>{words("settings.tabs.token.clientTypes.help")}</HelperTextItem>
          </HelperText>
        </FlexItem>
      </Flex>
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
    <PaddedFlex alignItems={{ default: "alignItemsFlexEnd" }}>
      <FlexItem>
        {/* An idempotent (non-revocable) token carries no time-based claims, so it cannot expire. */}
        <ExpiryInput onChange={onExpireChange} isDisabled={isBusy || !isRevocable} />
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

const Container = styled.div`
  padding-top: 1rem;
`;

const PaddedFlex = styled(Flex)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;
