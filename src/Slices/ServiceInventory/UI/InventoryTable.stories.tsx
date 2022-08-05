import React, { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { Story } from "@storybook/react/types-6-0";
import { StoreProvider } from "easy-peasy";
import {
  QueryResolverImpl,
  getStoreInstance,
  QueryManagerResolver,
} from "@/Data";
import { InstantApiHelper, Row, StaticScheduler, tablePresenter } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { InventoryTable } from "./InventoryTable";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(
      store,
      new InstantApiHelper(() => ({
        kind: "Success",
        data: { data: [] },
      })),
      new StaticScheduler(),
      new StaticScheduler()
    )
  );

  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver }}>
        <StoreProvider store={store}>
          <InventoryTable
            {...args}
            sort={{ name: "created_at", order: "desc" }}
            setSort={() => undefined}
            tablePresenter={tablePresenter}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
};

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Multiple = Template.bind({});
Multiple.args = { rows: [Row.a, Row.b] };
