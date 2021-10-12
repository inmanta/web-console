import { ResourceParams } from "@/Core";
import { createContext } from "react";

interface SetFilterProvider {
  setFilter: (filter: ResourceParams.Filter) => void;
}

export const ResourceFilterContext = createContext<SetFilterProvider>({
  setFilter: () => {
    throw new Error("Method not implemented.");
  },
});
