import React from "react";
import { Story } from "@storybook/react/types-6-0";
import {
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  MockCommandManager,
  MockEnvironmentModifier,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { TableProvider, Props } from "./TableProvider";
import { StoreProvider } from "easy-peasy";
import { ServiceModel } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  getStoreInstance,
  CommandResolverImpl,
} from "@/Data";
import { MemoryRouter } from "react-router";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const Template: Story<Props> = (args) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new InstanceResourcesQueryManager(
        new InstantApiHelper({
          kind: "Success",
          data: { data: [] },
        }),
        new InstanceResourcesStateHelper(store),
        new StaticScheduler(),
        Service.a.environment
      ),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([new MockCommandManager()])
  );

  return (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          queryResolver,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
        }}
      >
        <StoreProvider store={store}>
          <TableProvider
            {...args}
            sort={{ name: "created_at", order: "desc" }}
            setSort={() => undefined}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
};

export const Empty = Template.bind({});
Empty.args = { instances: [], serviceEntity: {} as ServiceModel };

const instances = [
  { ...ServiceInstance.a, id: "10051234" },
  { ...ServiceInstance.b, id: "20051234" },
  { ...ServiceInstance.c, id: "30051234" },
];

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
