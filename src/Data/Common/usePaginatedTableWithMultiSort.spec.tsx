import React from "react";
import { act, renderHook } from "@testing-library/react";
import { PageSize, Resource } from "@/Core";
import { MultiSort } from "@/Data";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { usePaginatedTableWithMultiSort } from "./usePaginatedTableWithMultiSort";

const wrapper =
  (search = "") =>
  ({ children }: { children: React.ReactNode }) => (
    <TestMemoryRouter initialEntries={[`/${search}`]}>{children}</TestMemoryRouter>
  );

// ── sort parsing ─────────────────────────────────────────────────────────────

test.each`
  search                                                | searchText                      | expectedSort                                                             | valueText
  ${""}                                                 | ${"empty"}                      | ${[]}                                                                    | ${"default empty"}
  ${"?state.Resources.sort=agent.asc"}                  | ${"agent.asc"}                  | ${[{ name: "agent", order: "asc" }]}                                     | ${"agent.asc"}
  ${"?state.Resources.sort=agent.asc,blocked.desc"}     | ${"agent.asc,blocked.desc"}     | ${[{ name: "agent", order: "asc" }, { name: "blocked", order: "desc" }]} | ${"agent.asc,blocked.desc"}
  ${"?state.Resources.sort=resource_type.desc,agent.asc"} | ${"resource_type.desc,agent.asc"} | ${[{ name: "resource_type", order: "desc" }, { name: "agent", order: "asc" }]} | ${"resource_type.desc,agent.asc (order preserved)"}
  ${"?state.Resources.sort=invalid"}                    | ${"invalid"}                    | ${[]}                                                                    | ${"default empty (bad entry dropped)"}
  ${"?state.Resources.sort=agent.asc,bad,blocked.desc"} | ${"agent.asc,bad,blocked.desc"} | ${[{ name: "agent", order: "asc" }, { name: "blocked", order: "desc" }]} | ${"agent.asc,blocked.desc (bad entry dropped)"}
`(
  "GIVEN usePaginatedTableWithMultiSort WHEN search is $searchText THEN sort returns $valueText",
  ({ search, expectedSort }: { search: string; expectedSort: MultiSort<Resource.SortKey> }) => {
    const { result } = renderHook(
      () => usePaginatedTableWithMultiSort<undefined, Resource.SortKey>({ route: "Resources" }),
      { wrapper: wrapper(search) }
    );

    expect(result.current.sort).toEqual(expectedSort);
  }
);

// ── defaultSort ──────────────────────────────────────────────────────────────

test("GIVEN usePaginatedTableWithMultiSort WHEN no URL sort param THEN returns defaultSort", () => {
  const defaultSort: MultiSort<Resource.SortKey> = [{ name: "agent", order: "asc" }];

  const { result } = renderHook(
    () => usePaginatedTableWithMultiSort<undefined, Resource.SortKey>({ route: "Resources", defaultSort }),
    { wrapper: wrapper() }
  );

  expect(result.current.sort).toEqual(defaultSort);
});

test("GIVEN usePaginatedTableWithMultiSort WHEN URL sort param is set THEN URL value overrides defaultSort", () => {
  const { result } = renderHook(
    () =>
      usePaginatedTableWithMultiSort<undefined, Resource.SortKey>({
        route: "Resources",
        defaultSort: [{ name: "agent", order: "asc" }],
      }),
    { wrapper: wrapper("?state.Resources.sort=blocked.desc") }
  );

  expect(result.current.sort).toEqual([{ name: "blocked", order: "desc" }]);
});

// ── pageSize ─────────────────────────────────────────────────────────────────

test.each`
  search                               | searchText | expectedPageSize        | valueText
  ${""}                                | ${"empty"} | ${PageSize.from("100")} | ${"100 (Resources default)"}
  ${"?state.Resources.pageSize=20"}    | ${"20"}    | ${PageSize.from("20")}  | ${"20"}
`(
  "GIVEN usePaginatedTableWithMultiSort WHEN search is $searchText THEN pageSize returns $valueText",
  ({ search, expectedPageSize }: { search: string; expectedPageSize: PageSize.Type }) => {
    const { result } = renderHook(
      () => usePaginatedTableWithMultiSort<undefined, Resource.SortKey>({ route: "Resources" }),
      { wrapper: wrapper(search) }
    );

    expect(result.current.pageSize).toEqual(expectedPageSize);
  }
);

// ── currentPage auto-reset ───────────────────────────────────────────────────

test("GIVEN usePaginatedTableWithMultiSort WHEN sort changes THEN currentPage resets to empty", async () => {
  const { result } = renderHook(
    () => usePaginatedTableWithMultiSort<undefined, Resource.SortKey>({ route: "Resources" }),
    { wrapper: wrapper() }
  );

  await act(async () => {
    result.current.setCurrentPage({ kind: "CurrentPage", value: "start=some_resource" });
  });

  await act(async () => {
    result.current.setSort([{ name: "agent", order: "asc" }]);
  });

  expect(result.current.currentPage.value).toBe("");
});

test("GIVEN usePaginatedTableWithMultiSort WHEN filter changes THEN currentPage resets to empty", async () => {
  const { result } = renderHook(
    () => usePaginatedTableWithMultiSort<{ type?: string[] }, Resource.SortKey>({ route: "Resources" }),
    { wrapper: wrapper() }
  );

  await act(async () => {
    result.current.setCurrentPage({ kind: "CurrentPage", value: "start=some_resource" });
  });

  await act(async () => {
    result.current.setFilter({ type: ["Frontend"] });
  });

  expect(result.current.currentPage.value).toBe("");
});
