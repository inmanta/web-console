import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { TreeTable } from "./TreeTable";
import { instance } from "@/Test/Data";

export default {
  title: "TreeTable",
  component: TreeTable,
};

const Template: Story<ComponentProps<typeof TreeTable>> = (args) => (
  <TreeTable {...args} />
);

const candidate_attributes = {
  a: {
    b: {
      c: "c",
    },
  },
  b: 1234,
  c: false,
  d: "blabla",
  e: {
    f: true,
    g: [],
    h: {
      i: {
        j: 1234,
      },
    },
  },
  f: {
    g: "123",
  },
};

export const Simple = Template.bind({});
Simple.args = {
  attributes: {
    candidate: candidate_attributes,
    active: null,
    rollback: null,
  },
};

export const RealData = Template.bind({});
RealData.args = {
  attributes: {
    candidate: instance.candidate_attributes,
    active: instance.active_attributes,
    rollback: instance.rollback_attributes,
  },
};
