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

test("TreeTableHelper createRows returns correctly ordered list", () => {
  // Arrange
  const treeTableHelper = new TreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new AttributeHelper("$"),
    {
      candidate: null,
      active: {
        deallocation_ctx: {
          "network_interfaces[name=eth0].allocated_id": 123456,
        },
        description: "Server",
      },
      rollback: {
        description: "Server",
        deallocation_ctx: {
          "network_interfaces[name=eth0].allocated_id": 123456,
          "network_interfaces[name=eth1].allocated_id": 456789,
        },
      },
    }
  );
  // Act
  const cb = jest.fn;
  const rows = treeTableHelper.createRows({ deallocation_ctx: false }, cb);
  // Assert
  const expectedRows = [
    {
      kind: "Root",
      id: "deallocation_ctx",
      isChildExpanded: false,
      primaryCell: { label: "name", value: "deallocation_ctx" },
    },
    {
      kind: "Leaf",
      id: "deallocation_ctx$network_interfaces[name=eth0].allocated_id",
      isExpandedByParent: false,
      level: 1,
      primaryCell: {
        label: "name",
        value: "network_interfaces[name=eth0].allocated_id",
      },
      valueCells: [
        { label: "candidate", value: "" },
        { label: "active", value: "123456" },
        { label: "rollback", value: "123456" },
      ],
    },
    {
      kind: "Leaf",
      id: "deallocation_ctx$network_interfaces[name=eth1].allocated_id",
      isExpandedByParent: false,
      level: 1,
      primaryCell: {
        label: "name",
        value: "network_interfaces[name=eth1].allocated_id",
      },
      valueCells: [
        { label: "candidate", value: "" },
        { label: "active", value: "" },
        { label: "rollback", value: "456789" },
      ],
    },
    {
      kind: "Flat",
      id: "description",
      primaryCell: { label: "name", value: "description" },
      valueCells: [
        { label: "candidate", value: "" },
        { label: "active", value: "Server" },
        { label: "rollback", value: "Server" },
      ],
    },
  ];
  expect(rows).toMatchObject(expectedRows);
});
