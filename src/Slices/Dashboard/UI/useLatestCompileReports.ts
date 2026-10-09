import { PageSize } from "@/Core/Domain";
import { useGetCompileReports } from "@/Data/Queries";

const PARAMS = {
  pageSize: PageSize.few,
  currentPage: { kind: "CurrentPage" as const, value: "" },
  sort: { name: "requested" as const, order: "desc" as const },
};

/**
 * The 5 most recent compile reports, sorted newest-first — shared by the Environment Health
 * row's Compiles column (only needs `data[0]`, the latest report) and the Latest Compile Reports
 * panel (shows all 5). Both call this hook with identical params so React Query dedupes them
 * into a single request instead of firing one query per consumer.
 */
export const useLatestCompileReports = () => useGetCompileReports(PARAMS).useContinuous();
