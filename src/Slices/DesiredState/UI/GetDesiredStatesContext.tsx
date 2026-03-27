import { createContext } from "react";
import { PageSize, ParsedNumber } from "@/Core";
import { CurrentPage, initialCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { CompareSelection } from "./Utils";

interface GetDesiredStatesProvider {
  filter: Filter;
  pageSize: PageSize.Type;
  currentPage: CurrentPage;
  compareSelection: CompareSelection;
  setCompareSelection(selection: CompareSelection): void;
  setDeleteModal: (version: ParsedNumber, modalState: boolean) => void;
}

export const GetDesiredStatesContext = createContext<GetDesiredStatesProvider>({
  filter: {},
  pageSize: PageSize.initial,
  currentPage: initialCurrentPage,
  compareSelection: { kind: "None" },
  setCompareSelection: () => undefined,
  setDeleteModal: () => undefined,
});
