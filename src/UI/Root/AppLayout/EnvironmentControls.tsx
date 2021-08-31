import { RemoteData } from "@/Core";
import {
  Button,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import {
  CheckIcon,
  CrossIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
} from "@patternfly/react-icons";
import React, { useContext } from "react";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ConfirmationDialog, LoadingView } from "@/UI/Components";

interface Props {
  environment: string;
}

export const EnvironmentControls: React.FC<Props> = ({ environment }) => {
  const { commandResolver, queryResolver, urlManager } =
    useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"EnvironmentDetails">({
    kind: "EnvironmentDetails",
  });
  const statusButton = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Button
          variant="danger"
          aria-label="Server status"
          icon={<CrossIcon />}
          component="a"
          href={urlManager.getServerStatusUrl()}
          target="_blank"
        />
      ),
      failed: () => (
        <Button
          variant="danger"
          aria-label="Server status"
          icon={<CrossIcon />}
          component="a"
          href={urlManager.getServerStatusUrl()}
          target="_blank"
        />
      ),
      success: () => (
        <GreenButton
          icon={<CheckIcon />}
          component="a"
          aria-label="Server status"
          href={urlManager.getServerStatusUrl()}
          target="_blank"
        />
      ),
    },
    data
  );

  const startStopButton = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: () => <Button variant="danger" isDisabled />,
      success: (data) => {
        const haltEnvironmentTrigger =
          commandResolver.getTrigger<"HaltEnvironment">({
            kind: "HaltEnvironment",
          });
        const resumeEnvironmentTrigger =
          commandResolver.getTrigger<"ResumeEnvironment">({
            kind: "ResumeEnvironment",
          });
        if (data.halted) {
          return (
            <ConfirmationDialog
              modalButton={
                <GreenButton
                  icon={<PlayIcon />}
                  onClick={resumeEnvironmentTrigger}
                >
                  {words("environment.resume.button")}
                </GreenButton>
              }
              onConfirm={resumeEnvironmentTrigger}
              modalContent={words("environment.resume.details")(environment)}
              title={words("environment.resume.title")}
              confirmText={words("yes")}
              cancelText={words("no")}
            />
          );
        } else {
          return (
            <ConfirmationDialog
              modalButton={
                <Button
                  variant="danger"
                  icon={<StopIcon />}
                  onClick={haltEnvironmentTrigger}
                >
                  {words("environment.halt.button")}
                </Button>
              }
              onConfirm={haltEnvironmentTrigger}
              modalContent={words("environment.halt.details")(environment)}
              title={words("environment.halt.title")}
              confirmText={words("yes")}
              cancelText={words("no")}
            />
          );
        }
      },
    },
    data
  );
  const warningLabel = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: (data) => {
        if (data.halted) {
          return (
            <Label color="orange" icon={<ExclamationTriangleIcon />}>
              {words("environment.halt.label")}
            </Label>
          );
        } else {
          return <></>;
        }
      },
    },
    data
  );

  return (
    <PaddedStack>
      <PaddedStackItem>{warningLabel}</PaddedStackItem>
      <StackItem>
        <Flex>
          <FlexItem>{statusButton}</FlexItem>
          <FlexItem>{startStopButton}</FlexItem>
        </Flex>
      </StackItem>
    </PaddedStack>
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-global--success-color--100);
  }
`;

const PaddedStack = styled(Stack)`
  padding-left: 1.5rem;
`;
const PaddedStackItem = styled(StackItem)`
  padding-bottom: 1rem;
`;
