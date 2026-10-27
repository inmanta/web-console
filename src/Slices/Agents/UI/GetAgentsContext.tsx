import { createContext } from "react";
import { Filter } from "@/Slices/Agents/Core/Types";
import { PageSize, Sort } from "@inmanta/web-console-core";
import {
  CurrentPage,
  initialCurrentPage,
} from "@inmanta/web-console-core/Common/UrlState/useUrlStateWithCurrentPage";

interface GetAgentsProvider {
  filter: Filter;
  sort: Sort.Type;
  pageSize: PageSize.Type;
  currentPage: CurrentPage;
}

export const GetAgentsContext = createContext<GetAgentsProvider>({
  filter: {},
  sort: { name: "name", order: "asc" },
  pageSize: PageSize.initial,
  currentPage: initialCurrentPage,
});
