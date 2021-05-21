import React from "react";
import { Story } from "@storybook/react/types-6-0";
import {
  DynamicQueryManagerResolver,
  instances,
  InstantFetcher,
  Service,
  StaticScheduler,
} from "@/Test";
import { TableProvider, Props } from "./TableProvider";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import { ServiceModel } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ResourcesQueryManager,
  ResourcesStateHelper,
} from "@/UI/Data";
import { MemoryRouter } from "react-router";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const Template: Story<Props> = (args) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourcesQueryManager(
        new InstantFetcher<"Resources">({
          kind: "Success",
          data: { data: [] },
        }),
        new ResourcesStateHelper(store),
        new StaticScheduler(),
        Service.A.environment
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
      <MemoryRouter>
        <StoreProvider store={store}>
          <TableProvider {...args} />
        </StoreProvider>
      </MemoryRouter>
    </DependencyProvider>
  );
};

export const Empty = Template.bind({});
Empty.args = { instances: [], serviceEntity: {} as ServiceModel };

export const Multiple = Template.bind({});
Multiple.args = {
  instances,
  serviceEntity: {
    name: "cloudconnectv2",
    lifecycle: {
      states: [{ name: "creating", label: "info" }],
      transfers: [{ source: "creating", on_update: true }],
    },
  } as ServiceModel,
};
export const WithIdentity = Template.bind({});
WithIdentity.args = {
  instances,
  serviceEntity: Service.withIdentity,
};
