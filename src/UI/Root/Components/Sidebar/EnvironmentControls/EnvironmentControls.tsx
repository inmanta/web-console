import React, { useContext, useEffect } from "react";
import { Flex, FlexItem, Label, Stack, StackItem } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { HaltButton } from "./HaltButton";
import { ResumeButton } from "./ResumeButton";

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
        success: () => {
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
      loading: () => null,
      failed: () => null,
      success: (data) => {
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
      },
    },
    data
  );
};
