import { createContext } from "react";
import { PageSize, ParsedNumber } from "@/Core";
import {
  CurrentPage,
  initialCurrentPage,
} from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { Filter } from "@S/DesiredState/Core/Query";
import { CompareSelection } from "./Utils";

interface GetDesiredStatesProvider {
  filter: Filter;
  pageSize: PageSize.Type;
  currentPage: CurrentPage;
  setErrorMessage(message: string): void;
  compareSelection: CompareSelection;
  setCompareSelection(selection: CompareSelection): void;
  setDeleteModal: (version: ParsedNumber, modalState: boolean) => void;
}

export const GetDesiredStatesContext = createContext<GetDesiredStatesProvider>({
  filter: {},
  pageSize: PageSize.initial,
  currentPage: initialCurrentPage,
  setErrorMessage: () => {
    throw Error("Method not implemented");
  },
  compareSelection: { kind: "None" },
  setCompareSelection: () => undefined,
  setDeleteModal: () => undefined,
});
