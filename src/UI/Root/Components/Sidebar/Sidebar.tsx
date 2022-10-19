import React from "react";
import { PageSidebar, Stack, StackItem } from "@patternfly/react-core";
import { EnvironmentControls } from "./EnvironmentControls";
import { Navigation } from "./Navigation";

export const Sidebar: React.FC<{
  environment: string | undefined;
}> = ({ environment }) => {
  return (
    <PageSidebar
      aria-label="PageSidebar"
      nav={
        <Stack>
          <StackItem>
            <Navigation environment={environment} />
          </StackItem>
          {environment && (
            <>
              <StackItem isFilled />
              <StackItem>
                <EnvironmentControls />
              </StackItem>
            </>
          )}
        </Stack>
      }
      theme="dark"
    />
  );
};
