import React from "react";
import { Page } from "@patternfly/react-core";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI";
import { View } from "./Page";

export default {
  title: "ComplianceCheck",
  component: View,
  parameters: {
    layout: "fullscreen",
  },
};

export const Default: React.FC = () => {
  const store = getStoreInstance();

  return (
    <DependencyProvider dependencies={dependencies}>
      <StoreProvider store={store}>
        <Page style={{ height: "100vh" }}>
          <View version="123" />
        </Page>
      </StoreProvider>
    </DependencyProvider>
  );
};
