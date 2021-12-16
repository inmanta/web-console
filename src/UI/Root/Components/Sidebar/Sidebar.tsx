import React from "react";
import { PageSidebar, Stack, StackItem } from "@patternfly/react-core";
import { EnvironmentControls } from "./EnvironmentControls";
import { Navigation } from "./Navigation";

export const Sidebar: React.FC<{
  isNavOpen: boolean;
  environment: string | undefined;
}> = ({ isNavOpen, environment }) => {
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
      isNavOpen={isNavOpen}
      theme="dark"
    />
  );
};
