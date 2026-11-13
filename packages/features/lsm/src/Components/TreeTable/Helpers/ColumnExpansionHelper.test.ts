import { ColumnExpansionHelper } from "./ColumnExpansionHelper";

test("Given the ColumnExpansionHelper with parameters used by the attributes table, When expanding columns and resetting their state Then returns the correct column widths", () => {
  const columnExpansionHelper = new ColumnExpansionHelper(60, 3, 10);
  const defaultState = columnExpansionHelper.getDefaultState(["type", "modifier", "description"]);

  expect(defaultState).toEqual({ type: 20, modifier: 20, description: 20 });

  const modifierExpanded = columnExpansionHelper.expandColumn(defaultState, "modifier");

  expect(modifierExpanded).toEqual({ type: 10, modifier: 40, description: 10 });

  const anotherExpanded = columnExpansionHelper.expandColumn(modifierExpanded, "type");

  expect(anotherExpanded).toEqual({ type: 40, modifier: 10, description: 10 });
});
