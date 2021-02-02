import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { instances } from "@/Test";
import { TableProvider, Props } from "./TableProvider";
import { createStore, StoreProvider } from "easy-peasy";
import { StoreModel, storeModel } from "@/UI/Store";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const storeInstance = createStore<StoreModel>(storeModel);

const Template: Story<Props> = (args) => (
  <StoreProvider store={storeInstance}>
    <TableProvider {...args} />
  </StoreProvider>
);

export const Empty = Template.bind({});
Empty.args = { instances: [] };

export const Multiple = Template.bind({});
Multiple.args = { instances };
