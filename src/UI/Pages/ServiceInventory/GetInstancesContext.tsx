import { createContext } from "react";
import { PageSize, ServiceInstanceParams, Sort } from "@/Core";

interface GetInstancesProvider {
  filter: ServiceInstanceParams.Filter;
  sort: Sort.Type;
  pageSize: PageSize.Type;
}

export const GetInstancesContext = createContext<GetInstancesProvider>({
  filter: {},
  sort: { name: "created_at", order: "desc" },
  pageSize: PageSize.initial,
});
