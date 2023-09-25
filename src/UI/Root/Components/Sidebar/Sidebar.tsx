import React from "react";
import {
  PageSidebar,
  Stack,
  StackItem,
  PageSidebarBody,
} from "@patternfly/react-core";
import { EnvironmentControls } from "./EnvironmentControls";
import { Navigation } from "./Navigation";

export const Sidebar: React.FC<{
  environment: string | undefined;
}> = ({ environment }) => {
  return (
    <PageSidebar aria-label="PageSidebar" theme="dark">
      <PageSidebarBody>
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
      </PageSidebarBody>
    </PageSidebar>
  );
};
