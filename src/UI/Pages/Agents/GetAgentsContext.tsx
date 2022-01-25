import { createContext } from "react";
import { AgentParams, PageSize, Sort } from "@/Core";

interface GetAgentsProvider {
  filter: AgentParams.Filter;
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
