import { createContext } from "react";
import { DesiredStateParams, PageSize } from "@/Core";

interface GetDesiredStatesProvider {
  filter: DesiredStateParams.Filter;
  pageSize: PageSize.Type;
  setErrorMessage: (message: string) => void;
}

export const GetDesiredStatesContext = createContext<GetDesiredStatesProvider>({
  filter: {},
  pageSize: PageSize.initial,
  setErrorMessage: () => {
    throw Error("Method not implemented");
  },
});
