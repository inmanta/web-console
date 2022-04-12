import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ServiceInstance } from "@/Test";
import {
  AttributeHelper,
  PathHelper,
  TreeExpansionManager,
  TreeTableHelper,
} from "./Helpers";
import { TreeTable } from "./TreeTable";

export default {
  title: "TreeTable",
  component: TreeTable,
};

const Template: Story<ComponentProps<typeof TreeTable>> = (args) => (
  <TreeTable {...args} />
);

export const Simple = Template.bind({});
Simple.args = {
  treeTableHelper: new TreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new AttributeHelper("$"),
    {
      candidate: {
        a: {
          b: {
            c: `{"attr1":["a","b"],"attr2":{"val1":"val2"},"attr10":15,"id_attr":"test1","embedded_multi":[{"attr3":0,"embedded_single":{"attr4":1}}]}`,
          },
        },
        b: 1234,
        c: false,
        d: "blabla long longlonglonglonglonglonglong value that's not a json",
        e: { f: true, g: [], h: { i: { j: 1234 } } },
        f: { g: "123" },
      },
      active: null,
      rollback: null,
    }
  ),
};

export const FlatOnly = Template.bind({});
FlatOnly.args = {
  treeTableHelper: new TreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new AttributeHelper("$"),
    {
      candidate: {
        b: 1234,
        c: false,
        d: "blabla",
      },
      active: null,
      rollback: null,
    }
  ),
};

export const RealData = Template.bind({});
RealData.args = {
  treeTableHelper: new TreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new AttributeHelper("$"),
    {
      candidate: null,
      active: ServiceInstance.a.active_attributes,
      rollback: null,
    }
  ),
};

export const MultipleAttributes = Template.bind({});
MultipleAttributes.args = {
  treeTableHelper: new TreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new AttributeHelper("$"),
    {
      candidate: {
        a: {
          b: {
            c: "candidate candidate candidate ",
            d: "candidate candidate candidate ",
          },
        },
      },
      active: { a: { b: { c: "active active active active ", d: "" } } },
      rollback: { a: { b: { c: "rollback rollback rollback ", d: "" } } },
    }
  ),
};

export const LongJsonAttributes = () => (
  <TreeTable
    treeTableHelper={
      new TreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new AttributeHelper("$"),
        {
          candidate: {
            a: {
              b: {
                c: `{"attr1":["a","b"],"attr2":{"val1":"val2"},"attr10":15,"id_attr":"test1","embedded_multi":[{"attr3":0,"embedded_single":{"attr4":1}}]}`,
              },
            },
            d: "long long long long long long long long value that's not a json",
          },
          active: null,
          rollback: null,
        }
      )
    }
  />
);
