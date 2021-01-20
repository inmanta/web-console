import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { instances } from "@/Test";
import { TableProvider, Props } from "./TableProvider";
import { createStore, StoreProvider } from "easy-peasy";
import { IStoreModel, storeModel } from "@app/Models/CoreModels";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const storeInstance = createStore<IStoreModel>(storeModel);

const Template: Story<Props> = (args) => (
  <StoreProvider store={storeInstance}>
    <TableProvider {...args} />
  </StoreProvider>
);

export const Empty = Template.bind({});
Empty.args = { instances: [] };

export const Multiple = Template.bind({});
Multiple.args = { instances };
