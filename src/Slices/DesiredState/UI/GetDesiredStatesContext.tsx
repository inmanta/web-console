import { createContext } from "react";
import { PageSize } from "@/Core";
import { Filter } from "@S/DesiredState/Core/Query";
import { CompareSelection } from "./Utils";

interface GetDesiredStatesProvider {
  filter: Filter;
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
