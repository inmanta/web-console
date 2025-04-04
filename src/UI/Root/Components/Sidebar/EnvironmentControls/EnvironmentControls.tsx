import React, { useContext, useEffect } from "react";
import {
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { HaltButton } from "./HaltButton";
import { ResumeButton } from "./ResumeButton";

export const EnvironmentControls: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const id = environmentHandler.useId();
  const { data, isSuccess, isError } =
    useGetEnvironmentDetails().useContinuous(id);

  useEffect(() => {
    if (isError) {
      document.dispatchEvent(new CustomEvent("status-down"));
    } else if (isSuccess) {
      document.dispatchEvent(new CustomEvent("status-up"));
    }
  }, [isSuccess, isError]);

  if (isSuccess) {
    return (
      <Stack hasGutter>
        <StackItem>
          {data.halted && (
            <Label status="warning">{words("environment.halt.label")}</Label>
          )}
        </StackItem>
        <StackItem>
          <Flex>
            <FlexItem>
              {data.halted ? <ResumeButton /> : <HaltButton />}
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    );
  }

  return null;
};
