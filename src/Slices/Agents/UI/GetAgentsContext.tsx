import { createContext } from "react";
import { PageSize, Sort } from "@/Core";
import { Filter } from "@S/Agents/Core/Query";

interface GetAgentsProvider {
  filter: Filter;
  sort: Sort.Type;
  pageSize: PageSize.Type;
  setErrorMessage: (message: string) => void;
}

export const GetAgentsContext = createContext<GetAgentsProvider>({
  filter: {},
  sort: { name: "name", order: "asc" },
  pageSize: PageSize.initial,
  setErrorMessage: () => {
    throw Error("Method not implemented");
  },
});
