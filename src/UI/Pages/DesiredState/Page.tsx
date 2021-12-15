import React, { useContext, useState } from "react";
import { DesiredStateParams, RemoteData } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import {
  EmptyView,
  ErrorToastAlert,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DesiredStatesTable } from "./DesiredStatesTable";
import { DesiredStatesTableControls } from "./DesiredStatesTableControls";
import { GetDesiredStatesContext } from "./GetDesiredStatesContext";

export const Page: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DesiredState",
  });
  const [filter, setFilter] = useUrlStateWithFilter<DesiredStateParams.Filter>({
    route: "DesiredState",
    dateRangeKey: "date",
    intRangeKey: "version",
  });
  const [data, retry] = queryResolver.useContinuous<"GetDesiredStates">({
    kind: "GetDesiredStates",
    filter,
    pageSize,
  });
  return (
    <PageSectionWithTitle title={words("desiredState.title")}>
      <DesiredStatesTableControls
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
      <GetDesiredStatesContext.Provider
        value={{ filter, pageSize, setErrorMessage }}
      >
        <ErrorToastAlert
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
        {RemoteData.fold(
          {
            notAsked: () => null,
            loading: () => (
              <LoadingView aria-label="DesiredStatesView-Loading" />
            ),
            failed: (error) => (
              <ErrorView
                message={error}
                retry={retry}
                aria-label="DesiredStatesView-Failed"
              />
            ),
            success: (desiredStates) =>
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
              ),
          },
          data
        )}
      </GetDesiredStatesContext.Provider>
    </PageSectionWithTitle>
  );
};
