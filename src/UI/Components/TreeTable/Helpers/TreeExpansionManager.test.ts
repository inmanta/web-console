import { TreeExpansionManager } from "./TreeExpansionManager";

test("TreeExpansionManager closes all children when parent is closed", () => {
  const treeExpansionManager = new TreeExpansionManager(".");
  const keys = ["a", "a.d", "a.e", "a.e.f", "b", "c"];
  const state1 = treeExpansionManager.create(keys);
  const state2 = treeExpansionManager.toggle(state1, "a");
  const state3 = treeExpansionManager.toggle(state2, "a.e");
  const state4 = treeExpansionManager.toggle(state3, "a.e.f");
  const state5 = treeExpansionManager.toggle(state4, "a");
  expect(state5).toEqual(state1);
});
