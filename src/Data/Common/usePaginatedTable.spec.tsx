import React from "react";
import { act, renderHook } from "@testing-library/react";
import { Filter } from "@/Slices/Agents/Core/Types";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { usePaginatedTable } from "./usePaginatedTable";

const wrapper =
  (search = "") =>
  ({ children }: { children: React.ReactNode }) => (
    <TestMemoryRouter initialEntries={[`/${search}`]}>{children}</TestMemoryRouter>
  );

// ── currentPage auto-reset ───────────────────────────────────────────────────

test("GIVEN usePaginatedTable WHEN mounted with a currentPage cursor in the URL THEN it is kept (issue #7218)", () => {
  const cursor = "start=some_agent";

  const { result } = renderHook(() => usePaginatedTable<Filter>({ route: "Agents" }), {
    wrapper: wrapper(`?state.Agents.currentPage[0]=${cursor}`),
  });

  expect(result.current.currentPage.value).toBe(cursor);
});

test("GIVEN usePaginatedTable WHEN sort changes THEN currentPage resets to empty", async () => {
  const { result } = renderHook(() => usePaginatedTable<Filter>({ route: "Agents" }), {
    wrapper: wrapper(),
  });

  await act(async () => {
    result.current.setCurrentPage({ kind: "CurrentPage", value: "start=some_agent" });
  });

  await act(async () => {
    result.current.setSort({ name: "name", order: "asc" });
  });

  expect(result.current.currentPage.value).toBe("");
});

test("GIVEN usePaginatedTable WHEN filter changes THEN currentPage resets to empty", async () => {
  const { result } = renderHook(() => usePaginatedTable<Filter>({ route: "Agents" }), {
    wrapper: wrapper(),
  });

  await act(async () => {
    result.current.setCurrentPage({ kind: "CurrentPage", value: "start=some_agent" });
  });

  await act(async () => {
    result.current.setFilter({ name: ["some_agent"] });
  });

  expect(result.current.currentPage.value).toBe("");
});
