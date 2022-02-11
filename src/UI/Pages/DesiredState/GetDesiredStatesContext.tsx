import { createContext } from "react";
import { DesiredStateParams, PageSize } from "@/Core";
import { CompareSelection } from "./Utils";

interface GetDesiredStatesProvider {
  filter: DesiredStateParams.Filter;
  pageSize: PageSize.Type;
  setErrorMessage(message: string): void;
  compareSelection: CompareSelection;
  setCompareSelection(selection: CompareSelection): void;
}

export const GetDesiredStatesContext = createContext<GetDesiredStatesProvider>({
  filter: {},
  pageSize: PageSize.initial,
  setErrorMessage: () => {
    throw Error("Method not implemented");
  },
  compareSelection: { kind: "None" },
  setCompareSelection: () => undefined,
});
