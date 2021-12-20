import { createContext } from "react";
import { Resource } from "@/Core";

interface SetFilterProvider {
  setFilter: (filter: Resource.Filter) => void;
}

export const ResourceFilterContext = createContext<SetFilterProvider>({
  setFilter: () => {
    throw new Error("Method not implemented.");
  },
});
