import React, { useContext, useEffect } from "react";
import {
  Bullseye,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { Spinner } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { HaltDialog } from "./HaltDialog";
import { ResumeDialog } from "./ResumeDialog";

export const EnvironmentControls: React.FC = () => {
  const { queryResolver, environmentHandler } = useContext(DependencyContext);

  const id = environmentHandler.useId();
  const [data] = queryResolver.useContinuous<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
    details: false,
    id,
  });
  useEffect(() => {
    RemoteData.fold(
      {
        notAsked: () => null,
        loading: () => null,
        failed: () => {
          document.dispatchEvent(new CustomEvent("status-down"));
          return null;
        },
        success: (details) => {
          document.dispatchEvent(
            new CustomEvent("expert-mode-check", {
              detail: details.settings.enable_lsm_expert_mode,
            })
          );
          document.dispatchEvent(new CustomEvent("status-up"));
          return null;
        },
      },
      data
    );
  }, [data]);
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Bullseye>
          <Spinner variant="light" />
        </Bullseye>
      ),
      failed: () => null,
      success: (data) => {
        return (
          <PaddedStack>
            <PaddedStackItem>
              {data.halted && (
                <Label color="orange" icon={<ExclamationTriangleIcon />}>
                  {words("environment.halt.label")}
                </Label>
              )}
            </PaddedStackItem>
            <StackItem>
              <Flex>
                <FlexItem>
                  {data.halted ? <ResumeDialog /> : <HaltDialog />}
                </FlexItem>
              </Flex>
            </StackItem>
          </PaddedStack>
        );
      },
    },
    data
  );
};

const PaddedStack = styled(Stack)`
  padding-left: 1.5rem;
`;
const PaddedStackItem = styled(StackItem)`
  padding-bottom: 1rem;
`;
