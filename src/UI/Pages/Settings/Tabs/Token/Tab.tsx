import React, { useContext, useState } from "react";
import { ClientType, Either, Maybe, toggleValueInList } from "@/Core";
import { ClipboardCopyButton, Description } from "@/UI/Components";
import { words } from "@/UI/words";
import styled from "styled-components";
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
import { DependencyContext } from "@/UI";

export const Tab: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<Maybe.Maybe<string>>(Maybe.none());
  const [token, setToken] = useState<Maybe.Maybe<string>>(Maybe.none());
  const trigger = commandResolver.getTrigger<"GenerateToken">({
    kind: "GenerateToken",
  });

  const isClientTypeSelected = (clientType: ClientType): boolean =>
    clientTypes.includes(clientType);

  const getClientTypeSelector =
    (clientType: ClientType) => (selected: boolean) => {
      if (selected && clientTypes.includes(clientType)) return;
      if (!selected && !clientTypes.includes(clientType)) return;
      setClientTypes(toggleValueInList(clientType, clientTypes));
    };

  const onGenerate = async () => {
    setError(Maybe.none());
    setToken(Maybe.none());
    setIsBusy(true);
    const result = await trigger({
      client_types: clientTypes,
      idempotent: false,
    });
    setIsBusy(false);

    if (Either.isLeft(result)) {
      setError(Maybe.some(result.value));
    } else {
      setToken(Maybe.some(result.value));
    }
  };

  return (
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

      {Maybe.isSome(error) && (
        <Alert
          isInline
          variant="danger"
          title="Something went wrong"
          actionClose={
            <AlertActionCloseButton onClose={() => setError(Maybe.none())} />
          }
        >
          <p>{error.value}</p>
        </Alert>
      )}

      <PaddedInputGroup>
        <TextInput
          name="token"
          id="token"
          type="text"
          aria-label="token"
          isDisabled={Maybe.isNone(token)}
          value={Maybe.withFallback(token, "")}
        />
        <ClipboardCopyButton
          value={Maybe.withFallback(token, "")}
          isDisabled={Maybe.isNone(token)}
          variant="control"
          aria-label="CopyTokenToClipboard"
        />
      </PaddedInputGroup>
    </Container>
  );
};

const PaddedInputGroup = styled(InputGroup)`
  padding-top: 1rem;
  max-width: 600px;
`;

const Container = styled.div`
  padding-top: 1rem;
`;

const PaddedFlex = styled(Flex)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;
