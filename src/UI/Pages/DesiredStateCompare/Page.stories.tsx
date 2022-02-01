import React from "react";
import { Page } from "@patternfly/react-core";
import { StoreProvider } from "easy-peasy";
import {
  GetDesiredStateDiffQueryManager,
  GetDesiredStateDiffStateHelper,
  getStoreInstance,
  QueryResolverImpl,
} from "@/Data";
import {
  dependencies,
  DesiredStateDiff,
  DynamicQueryManagerResolver,
  InstantApiHelper,
} from "@/Test";
import { DependencyProvider } from "@/UI";
import { View } from "./Page";

export default {
  title: "DesiredStateCompare",
  component: View,
  parameters: {
    layout: "fullscreen",
  },
};

export const Default: React.FC = () => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetDesiredStateDiffQueryManager(
        new InstantApiHelper({
          kind: "Success",
          data: DesiredStateDiff.response,
        }),
        new GetDesiredStateDiffStateHelper(store)
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
      <StoreProvider store={store}>
        <Page>
          <View from="123" to="456" />
        </Page>
      </StoreProvider>
    </DependencyProvider>
  );
};
