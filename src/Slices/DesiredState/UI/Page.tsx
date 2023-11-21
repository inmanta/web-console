import React, { useContext, useState } from "react";
import { ParsedNumber } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  ToastAlert,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter } from "@S/DesiredState/Core/Query";
import { TableControls } from "./Components";
import { DeleteModal } from "./Components/DeleteModal";
import { DesiredStatesTable } from "./DesiredStatesTable";
import { GetDesiredStatesContext } from "./GetDesiredStatesContext";
import { CompareSelection } from "./Utils";

export const Page: React.FC = () => {
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<ParsedNumber>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "DesiredState",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DesiredState",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "DesiredState",
    keys: { date: "DateRange", version: "IntRange" },
  });
  const [data, retry] = queryResolver.useContinuous<"GetDesiredStates">({
    kind: "GetDesiredStates",
    filter,
    pageSize,
    currentPage,
  });
  const [compareSelection, setCompareSelection] = useState<CompareSelection>({
    kind: "None",
  });
  function setDeleteModal(version: ParsedNumber, modalState: boolean) {
    setIsModalOpened(modalState);
    setVersionToDelete(modalState ? version : 0);
  }
  return (
    <PageContainer title={words("desiredState.title")}>
      <GetDesiredStatesContext.Provider
        value={{
          filter,
          pageSize,
          currentPage,
          setErrorMessage,
          compareSelection,
          setCompareSelection,
          setDeleteModal,
        }}
      >
        <TableControls
          filter={filter}
          setFilter={setFilter}
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
        />
        <ToastAlert
          data-testid="ToastAlert"
          title={words("desiredState.actions.promote.failed")}
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <RemoteDataView
          data={data}
          retry={retry}
          label="DesiredStatesView"
          SuccessView={(desiredStates) =>
            desiredStates.data.length <= 0 ? (
              <EmptyView
                message={words("desiredState.empty.message")}
                aria-label="DesiredStatesView-Empty"
              />
            ) : (
              <DesiredStatesTable
                rows={desiredStates.data}
                aria-label="DesiredStatesView-Success"
              />
            )
          }
        />
        <DeleteModal
          kind="DeleteVersion"
          version={versionToDelete}
          isOpened={isModalOpened}
        />
      </GetDesiredStatesContext.Provider>
    </PageContainer>
  );
};
