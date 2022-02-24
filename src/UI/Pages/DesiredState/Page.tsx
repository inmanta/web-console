import React, { useContext, useState } from "react";
import { DesiredStateParams } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import {
  EmptyView,
  ErrorToastAlert,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { TableControls } from "./Components";
import { DesiredStatesTable } from "./DesiredStatesTable";
import { GetDesiredStatesContext } from "./GetDesiredStatesContext";
import { CompareSelection } from "./Utils";

export const Page: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DesiredState",
  });
  const [filter, setFilter] = useUrlStateWithFilter<DesiredStateParams.Filter>({
    route: "DesiredState",
    keys: { date: "DateRange", version: "IntRange" },
  });
  const [data, retry] = queryResolver.useContinuous<"GetDesiredStates">({
    kind: "GetDesiredStates",
    filter,
    pageSize,
  });
  const [compareSelection, setCompareSelection] = useState<CompareSelection>({
    kind: "None",
  });

  return (
    <PageContainer title={words("desiredState.title")}>
      <GetDesiredStatesContext.Provider
        value={{
          filter,
          pageSize,
          setErrorMessage,
          compareSelection,
          setCompareSelection,
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
            />
          }
        />
        <ErrorToastAlert
          title={words("desiredState.actions.promote.failed")}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
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
      </GetDesiredStatesContext.Provider>
    </PageContainer>
  );
};
