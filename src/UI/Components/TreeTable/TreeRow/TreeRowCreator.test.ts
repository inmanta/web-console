import {
  InventoryAttributes,
  MultiAttributeNode,
} from "@/UI/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@/UI/Components/TreeTable/Helpers/PathHelper";
import { TreeRow } from "./TreeRow";
import { extractInventoryValues, TreeRowCreator } from "./TreeRowCreator";

const onToggle = () => {
  undefined;
};

const treeRowCreator = new TreeRowCreator(
  new PathHelper("."),
  () => false,
  () => false,
  () => onToggle,
  extractInventoryValues
);

test("TreeRowCreator create returns Leaf for Leaf node", () => {
  const node: MultiAttributeNode<InventoryAttributes> = {
    kind: "Leaf",
    value: {
      candidate: "a",
      active: undefined,
      rollback: undefined,
    },
  };
  const row: TreeRow = {
    kind: "Leaf",
    id: "a.b",
    isExpandedByParent: false,
    primaryCell: { label: "name", value: "b" },
    valueCells: [
      { label: "candidate", value: "a" },
      { label: "active", value: "" },
      { label: "rollback", value: "" },
    ],
    level: 1,
  };
  expect(treeRowCreator.create("a.b", node)).toEqual(row);
});

test("TreeRowCreator create returns Flat for flat Leaf node", () => {
  const node: MultiAttributeNode<InventoryAttributes> = {
    kind: "Leaf",
    value: {
      candidate: "a",
      active: undefined,
      rollback: undefined,
    },
  };
  const row: TreeRow = {
    kind: "Flat",
    id: "b",
    valueCells: [
      { label: "candidate", value: "a" },
      { label: "active", value: "" },
      { label: "rollback", value: "" },
    ],
    primaryCell: { label: "name", value: "b" },
  };
  expect(treeRowCreator.create("b", node)).toEqual(row);
});

test("TreeRowCreator create returns Root for flat Branch node", () => {
  const row: TreeRow = {
    kind: "Root",
    id: "a",
    onToggle,
    isChildExpanded: false,
    primaryCell: { label: "name", value: "a" },
  };
  expect(treeRowCreator.create("a", { kind: "Branch" })).toEqual(row);
});

test("TreeRowCreator create returns Branch for nested Branch node", () => {
  const row: TreeRow = {
    kind: "Branch",
    id: "a.b",
    onToggle,
    isChildExpanded: false,
    isExpandedByParent: false,
    level: 1,
    primaryCell: { label: "name", value: "b" },
  };
  expect(treeRowCreator.create("a.b", { kind: "Branch" })).toEqual(row);
});
