import { createContext } from "react";
import { PageSize, Sort } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { Filter } from "@S/Agents/Core/Query";

interface GetAgentsProvider {
  filter: Filter;
  sort: Sort.Type;
  pageSize: PageSize.Type;
  currentPage: CurrentPage;
  setErrorMessage: (message: string) => void;
}

export const GetAgentsContext = createContext<GetAgentsProvider>({
  filter: {},
  sort: { name: "name", order: "asc" },
  pageSize: PageSize.initial,
  currentPage: { kind: "CurrentPage", value: [] },
  setErrorMessage: () => {
    throw Error("Method not implemented");
  },
});
