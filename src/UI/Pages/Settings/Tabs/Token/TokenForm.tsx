import React from "react";
import {
  Alert,
  AlertActionCloseButton,
  Button,
  Flex,
  FlexItem,
  InputGroup,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import {
  ClusterIcon,
  ProcessAutomationIcon,
  UserIcon,
} from "@patternfly/react-icons";
import styled from "styled-components";
import { ClientType, Maybe } from "@/Core";
import { ClipboardCopyButton, Description } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  onGenerate(): void;
  onErrorClose(): void;
  getClientTypeSelector(clientType: ClientType): (selected: boolean) => void;
  isClientTypeSelected(clientType: ClientType): boolean;
  token: Maybe.Maybe<string>;
  error: Maybe.Maybe<string>;
  isBusy: boolean;
}

export const TokenForm: React.FC<Props> = ({
  onGenerate,
  getClientTypeSelector,
  isClientTypeSelected,
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
            onChange={getClientTypeSelector("agent")}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<ClusterIcon />}
            text="api"
            aria-label="ApiOption"
            isSelected={isClientTypeSelected("api")}
            onChange={getClientTypeSelector("api")}
            isDisabled={isBusy}
          />
          <ToggleGroupItem
            icon={<ProcessAutomationIcon />}
            text="compiler"
            aria-label="CompilerOption"
            isSelected={isClientTypeSelected("compiler")}
            onChange={getClientTypeSelector("compiler")}
            isDisabled={isBusy}
          />
        </ToggleGroup>
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
        isReadOnly
        value={Maybe.withFallback(token, "")}
      />
      <ClipboardCopyButton
        value={Maybe.withFallback(token, "")}
        isDisabled={Maybe.isNone(token)}
        variant="control"
        aria-label="CopyTokenToClipboard"
      />
    </StyledInputGroup>
    {Maybe.isSome(error) && (
      <Alert
        isInline
        variant="danger"
        title="Something went wrong"
        actionClose={<AlertActionCloseButton onClose={onErrorClose} />}
        aria-label="GenerateTokenError"
      >
        <p>{error.value}</p>
      </Alert>
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
