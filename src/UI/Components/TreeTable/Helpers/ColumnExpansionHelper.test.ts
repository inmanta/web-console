import { ColumnExpansionHelper } from "./ColumnExpansionHelper";

test("Given the ColumnExpansionHelper with parameters used by the attributes table, When expanding columns and resetting their state Then returns the correct column widths", () => {
  const columnExpansionHelper = new ColumnExpansionHelper(60, 3, 10);
  const defaultState = columnExpansionHelper.getDefaultState(
    ["candidate", "active", "rollback"],
    []
  );
  expect(defaultState).toEqual({ candidate: 20, active: 20, rollback: 20 });

  const activeExpanded = columnExpansionHelper.expandColumn(
    defaultState,
    "active"
  );
  expect(activeExpanded).toEqual({ candidate: 10, active: 40, rollback: 10 });

  const anotherExpanded = columnExpansionHelper.expandColumn(
    activeExpanded,
    "candidate"
  );
  expect(anotherExpanded).toEqual({ candidate: 40, active: 10, rollback: 10 });

  const defaultWithOneEmpty = columnExpansionHelper.getDefaultState(
    ["candidate", "active", "rollback"],
    ["candidate"]
  );
  expect(defaultWithOneEmpty).toEqual({
    candidate: 10,
    active: 25,
    rollback: 25,
  });

  const defaultWithTwoEmpty = columnExpansionHelper.getDefaultState(
    ["candidate", "active", "rollback"],
    ["candidate", "active"]
  );
  expect(defaultWithTwoEmpty).toEqual({
    candidate: 10,
    active: 10,
    rollback: 40,
  });

  const defaultWithAllEmpty = columnExpansionHelper.getDefaultState(
    ["candidate", "active", "rollback"],
    ["candidate", "active", "rollback"]
  );
  expect(defaultWithAllEmpty).toEqual({
    candidate: 20,
    active: 20,
    rollback: 20,
  });
});
