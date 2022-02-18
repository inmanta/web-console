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
    <PageContainer title={words("desiredState.title")}>
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
