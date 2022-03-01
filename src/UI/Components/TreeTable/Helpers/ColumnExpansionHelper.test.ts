import { ColumnExpansionHelper } from "./ColumnExpansionHelper";

test("Given the ColumnExpansionHelper with parameters used by the attributes table, When collapsing and expanding columns Then returns the correct column widths", () => {
  const columnExpansionHelper = new ColumnExpansionHelper(60, 3, 10);
  const defaultState = columnExpansionHelper.getDefaultState([
    "candidate",
    "active",
    "rollback",
  ]);
  expect(defaultState).toEqual({ candidate: 20, active: 20, rollback: 20 });

  const candidateCollapsed = columnExpansionHelper.collapseColumn(
    defaultState,
    "candidate"
  );
  expect(candidateCollapsed).toEqual({
    candidate: 10,
    active: 25,
    rollback: 25,
  });

  const candidateAndRollbackCollapsed = columnExpansionHelper.collapseColumn(
    candidateCollapsed,
    "rollback"
  );
  expect(candidateAndRollbackCollapsed).toEqual({
    candidate: 10,
    active: 40,
    rollback: 10,
  });

  const allCollapsed = columnExpansionHelper.collapseColumn(
    candidateAndRollbackCollapsed,
    "active"
  );
  expect(allCollapsed).toEqual(defaultState);

  const activeExpanded = columnExpansionHelper.expandColumn(
    defaultState,
    "active"
  );
  expect(activeExpanded).toEqual(candidateAndRollbackCollapsed);

  const multipleExpanded = columnExpansionHelper.expandColumn(
    activeExpanded,
    "candidate"
  );
  expect(multipleExpanded).toEqual(defaultState);

  const candidateCollapsedTwice = columnExpansionHelper.collapseColumn(
    candidateCollapsed,
    "candidate"
  );
  expect(candidateCollapsedTwice).toEqual(candidateCollapsed);

  const activeExpandedTwice = columnExpansionHelper.expandColumn(
    activeExpanded,
    "active"
  );
  expect(activeExpandedTwice).toEqual(activeExpanded);

  const candidateCollapsedAndActiveExpanded =
    columnExpansionHelper.expandColumn(candidateCollapsed, "active");
  expect(candidateCollapsedAndActiveExpanded).toEqual(activeExpanded);
});
