import { AttributeHelper } from "./AttributeHelper";
import { PathHelper } from "./PathHelper";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeTableHelper } from "./TreeTableHelper";

test("TreeTableHelper getExpansionState returns correct expansionState", () => {
  // Arrange
  const treeTableHelper = new TreeTableHelper(
    new PathHelper("."),
    new TreeExpansionManager("."),
    new AttributeHelper("."),
    { candidate: null, active: { a: "b" }, rollback: null }
  );
  // Act
  const expansionState = treeTableHelper.getExpansionState();
  // Assert
  expect(expansionState).toEqual({
    a: false,
  });
});

test("TreeTableHelper createRows returns correct list", () => {
  // Arrange
  const treeTableHelper = new TreeTableHelper(
    new PathHelper("."),
    new TreeExpansionManager("."),
    new AttributeHelper("."),
    { candidate: null, active: { a: "b", c: { d: "e" } }, rollback: null }
  );
  // Act
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  const cb = () => {};
  const rows = treeTableHelper.createRows({ c: false }, cb);
  // Assert
  const expectedRows = [
    {
      kind: "Flat",
      id: "a",
      primaryCell: { label: "name", value: "a" },
      valueCells: [
        { label: "candidate", value: "" },
        { label: "active", value: "b" },
        { label: "rollback", value: "" },
      ],
    },
    {
      kind: "Root",
      id: "c",
      isChildExpanded: false,
      primaryCell: { label: "name", value: "c" },
    },
    {
      kind: "Leaf",
      id: "c.d",
      isExpandedByParent: false,
      level: 1,
      primaryCell: { label: "name", value: "d" },
      valueCells: [
        { label: "candidate", value: "" },
        { label: "active", value: "e" },
        { label: "rollback", value: "" },
      ],
    },
  ];
  expect(rows).toMatchObject(expectedRows);
});
