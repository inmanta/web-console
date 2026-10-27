import { createContext } from "react";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { PageSize, ParsedNumber } from "@inmanta/web-console-core";
import {
  CurrentPage,
  initialCurrentPage,
} from "@inmanta/web-console-core/Common/UrlState/useUrlStateWithCurrentPage";
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
  compareSelection: undefined,
  setCompareSelection: () => undefined,
  setDeleteModal: () => undefined,
});
