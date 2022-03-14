import React from "react";
import { Page } from "@patternfly/react-core";
import { StoreProvider } from "easy-peasy";
import {
  FileFetcherImpl,
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

const content1 = `127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6


0.0.0.1 test.test0.example.com`;
const content2 = `127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6


1.2.3.4 test.test0.example.com`;
const encoded1 = window.btoa(content1);
const encoded2 = window.btoa(content2);
console.log({ content1, encoded1, content2, encoded2 });

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

  const fileFetcher = new FileFetcherImpl(
    new InstantApiHelper({ kind: "Success", data: { content: encoded1 } }),
    "env"
  );

  return (
    <DependencyProvider
      dependencies={{ ...dependencies, queryResolver, fileFetcher }}
    >
      <StoreProvider store={store}>
        <Page style={{ height: "100vh" }}>
          <View from="123" to="456" />
        </Page>
      </StoreProvider>
    </DependencyProvider>
  );
};
