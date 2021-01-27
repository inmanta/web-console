import { TreeRowCreator } from "./TreeRowCreator";
import { PathHelper, MultiAttributeNode } from "../Helpers";
import { TreeRow } from "./TreeRow";

const onToggle = () => {
  undefined;
};

const treeRowCreator = new TreeRowCreator(
  new PathHelper("."),
  () => false,
  () => false,
  () => onToggle
);

test("TreeRowCreator create returns Leaf for Leaf node", () => {
  const node: MultiAttributeNode = {
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
    cell: { label: "name", value: "b" },
    cells: [
      { label: "candidate", value: "a" },
      { label: "active", value: "" },
      { label: "rollback", value: "" },
    ],
    level: 1,
  };
  expect(treeRowCreator.create("a.b", node)).toEqual(row);
});

test("TreeRowCreator create returns Flat for flat Leaf node", () => {
  const node: MultiAttributeNode = {
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
    cell: { label: "name", value: "b" },
    cells: [
      { label: "candidate", value: "a" },
      { label: "active", value: "" },
      { label: "rollback", value: "" },
    ],
  };
  expect(treeRowCreator.create("b", node)).toEqual(row);
});

test("TreeRowCreator create returns Root for flat Branch node", () => {
  const row: TreeRow = {
    kind: "Root",
    id: "a",
    cell: { label: "name", value: "a" },
    onToggle,
    isChildExpanded: false,
  };
  expect(treeRowCreator.create("a", { kind: "Branch" })).toEqual(row);
});

test("TreeRowCreator create returns Branch for nested Branch node", () => {
  const row: TreeRow = {
    kind: "Branch",
    id: "a.b",
    cell: { label: "name", value: "b" },
    onToggle,
    isChildExpanded: false,
    isExpandedByParent: false,
    level: 1,
  };
  expect(treeRowCreator.create("a.b", { kind: "Branch" })).toEqual(row);
});
