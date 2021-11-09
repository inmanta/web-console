import React from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { Navigation } from "@/UI/Root/Navigation";
import { EnvironmentControls } from "./EnvironmentControls";

export const Sidebar: React.FC<{ environment: string }> = ({ environment }) => {
  return (
    <Stack>
      <StackItem>
        <Navigation environment={environment} />
      </StackItem>
      <StackItem isFilled></StackItem>
      <StackItem>
        <EnvironmentControls />
      </StackItem>
    </Stack>
  );
};
