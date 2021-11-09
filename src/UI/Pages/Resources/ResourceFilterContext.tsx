import { createContext } from "react";
import { ResourceParams } from "@/Core";

interface SetFilterProvider {
  setFilter: (filter: ResourceParams.Filter) => void;
}

export const ResourceFilterContext = createContext<SetFilterProvider>({
  setFilter: () => {
    throw new Error("Method not implemented.");
  },
});
