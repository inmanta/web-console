import React, { useState } from "react";
import {
  Button,
  ExpandableSection,
  Form,
  FormGroup,
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
      <StyledFormGroup fieldId="client-types" label={words("settings.tabs.token.clientTypes")}>
        <ToggleGroup aria-label="ClientTypes">
          <ToggleGroupItem
            icon={<KeyIcon />}
            text={words("settings.tabs.token.clientTypes.api")}
            aria-label="ApiOption"
            isSelected={isClientTypeSelected("api")}
            onChange={(_event, selected) => getClientTypeSelector("api")(selected)}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<RobotIcon />}
            text={words("settings.tabs.token.clientTypes.agent")}
            aria-label="AgentOption"
            isSelected={isClientTypeSelected("agent")}
            onChange={(_event, selected) => getClientTypeSelector("agent")(selected)}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<CodeIcon />}
            text={words("settings.tabs.token.clientTypes.compiler")}
            aria-label="CompilerOption"
            isSelected={isClientTypeSelected("compiler")}
            onChange={(_event, selected) => getClientTypeSelector("compiler")(selected)}
            isDisabled={isBusy}
          />
        </ToggleGroup>
      </StyledFormGroup>
      <StyledDescription>{words("settings.tabs.token.description.details")}</StyledDescription>
    </ExpandableSection>
  );
};

interface Props {
  onGenerate(): void;
  onErrorClose(): void;
  getClientTypeSelector(clientType: ClientType): (selected: boolean) => void;
  isClientTypeSelected(clientType: ClientType): boolean;
  onExpireChange(value: number | null): void;
  onExpiryValidityChange(isValid: boolean): void;
  isExpiryValid: boolean;
  token: string | null;
  error: string | null;
  isBusy: boolean;
}

export const TokenForm: React.FC<Props> = ({
  onGenerate,
  getClientTypeSelector,
  isClientTypeSelected,
  onExpireChange,
  onExpiryValidityChange,
  isExpiryValid,
  token,
  error,
  onErrorClose,
  isBusy,
}) => (
  <Form isHorizontal>
    <Title className="lined_section" headingLevel="h2" size="md">
      {words("settings.tabs.token.title")}
    </Title>
    <Description>{words("settings.tabs.token.description")}</Description>
    <ExpiryInput
      onChange={onExpireChange}
      onValidityChange={onExpiryValidityChange}
      isDisabled={isBusy}
    />
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
      <Button variant="primary" onClick={onGenerate} isDisabled={isBusy || !isExpiryValid}>
        {words("settings.tabs.token.generate")}
      </Button>
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
  </Form>
);

const StyledInputGroup = styled(InputGroup)`
  padding-bottom: 4rem;
  padding-top: 1rem;
  max-width: 800px;
`;

// force the labels to not wrap after two words.
const StyledFormGroup = styled(FormGroup)`
  --pf-v6-c-form--m-horizontal__group-label--md--GridColumnWidth: 16rem;
`;

const StyledDescription = styled(Description)`
  margin-top: 1rem;
`;
