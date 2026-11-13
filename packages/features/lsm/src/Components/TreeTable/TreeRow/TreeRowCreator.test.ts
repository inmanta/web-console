import { AttributeNode } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/PathHelper";
import { TreeRow } from "./TreeRow";
import { extractCatalogValues, TreeRowCreator } from "./TreeRowCreator";

const onToggle = () => {};

const setupTreeRowCreator = () => {
  return new TreeRowCreator(
    new PathHelper("."),
    () => false,
    () => false,
    () => onToggle,
    extractCatalogValues
  );
};

const treeRowCreator = setupTreeRowCreator();

const leafNode: AttributeNode = {
  kind: "Leaf",
  value: {
    type: "string",
    modifier: "rw",
    description: undefined,
  },
};

const valueCells = [
  { label: "type", value: "string" },
  { label: "modifier", value: "rw" },
  { label: "description", value: "" },
];

test("TreeRowCreator create returns Leaf for Leaf node", () => {
  const row: TreeRow = {
    kind: "Leaf",
    id: "a.b",
    isExpandedByParent: false,
    primaryCell: { label: "name", value: "b" },
    valueCells,
    level: 1,
  };

  expect(treeRowCreator.create("a.b", leafNode)).toEqual(row);
});

test("TreeRowCreator create returns Flat for flat Leaf node", () => {
  const row: TreeRow = {
    kind: "Flat",
    id: "b",
    valueCells,
    primaryCell: { label: "name", value: "b" },
  };

  expect(treeRowCreator.create("b", leafNode)).toEqual(row);
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
