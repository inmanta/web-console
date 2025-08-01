import { PathHelper, TreeExpansionManager } from "@/UI/Components/TreeTable/Helpers";
import { InventoryAttributeHelper } from "./AttributeHelper";
import { InventoryTreeTableHelper } from "./TreeTableHelper";
//mock is to avoid TypeError - Temporary workaround - to be removed - https://github.com/inmanta/web-console/issues/6194
vi.mock("@/Data/Queries/Slices/ServiceInstance");

test("TreeTableHelper getExpansionState returns correct expansionState", () => {
  // Arrange
  const treeTableHelper = new InventoryTreeTableHelper(
    new PathHelper("."),
    new TreeExpansionManager("."),
    new InventoryAttributeHelper("."),
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
  const treeTableHelper = new InventoryTreeTableHelper(
    new PathHelper("."),
    new TreeExpansionManager("."),
    new InventoryAttributeHelper("."),
    { candidate: null, active: { a: "b", c: { d: "e" } }, rollback: null }
  );
  // Act

  const cb = () => {};
  const { rows } = treeTableHelper.createRows({ c: false }, cb);
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
  const treeTableHelper = new InventoryTreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new InventoryAttributeHelper("$"),
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
  const cb = vi.fn;
  const { rows } = treeTableHelper.createRows({ deallocation_ctx: false }, cb);
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
