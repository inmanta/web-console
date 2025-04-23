import React, { useContext, useEffect } from "react";
import { Flex, FlexItem, Label, Stack, StackItem } from "@patternfly/react-core";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { HaltButton } from "./HaltButton";
import { ResumeButton } from "./ResumeButton";

/**
 * This component is used to display the environment controls.
 * It is used to halt and resume the environment.
 * It also displays the status of the environment.
 *
 * @returns {React.FC}
 */
export const EnvironmentControls: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);

  const id = environmentHandler.useId();
  const { data, isSuccess, isError } = useGetEnvironmentDetails().useOneTime(id);

  useEffect(() => {
    if (isSuccess) {
      document.dispatchEvent(new CustomEvent("status-up"));
    }
    if (isError) {
      document.dispatchEvent(new CustomEvent("status-down"));
    }
  }, [isError, isSuccess]);

  if (isSuccess) {
    return (
      <Stack hasGutter>
        <StackItem>
          {data.halted && <Label status="warning">{words("environment.halt.label")}</Label>}
        </StackItem>
        <StackItem>
          <Flex>
            <FlexItem>{data.halted ? <ResumeButton /> : <HaltButton />}</FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    );
  }
  return null;
};
