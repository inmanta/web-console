import { Stack, StackItem } from "@patternfly/react-core";
import React from "react";
import { EnvironmentControls } from "./EnvironmentControls";
import { Navigation } from "@/UI/Root/Navigation";

export const Sidebar: React.FC<{ environment: string }> = ({ environment }) => {
  return (
    <Stack>
      <StackItem>
        <Navigation environment={environment} />
      </StackItem>
      <StackItem isFilled></StackItem>
      <StackItem>
        <EnvironmentControls environment={environment} />
      </StackItem>
    </Stack>
  );
};
