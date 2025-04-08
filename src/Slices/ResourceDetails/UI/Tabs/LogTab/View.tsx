import React, { useEffect } from "react";
import { toggleValueInList } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetResourceLogs } from "@/Data/Managers/V2/Resource";
import { EmptyView, ErrorView, LoadingView, PaginationWidget } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";
import { Controls } from "./Controls";
import { ResourceLogsTable } from "./ResourceLogsTable";

interface Props {
  resourceId: string;
}

/**
 * The LogTab component.
 *
 * This component is responsible of displaying the logs of a resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} resourceId - The id of the resource
 *
 * @returns {React.FC<Props>} A React Component displaying the logs of a resource
 */
export const View: React.FC<Props> = ({ resourceId }) => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "ResourceDetails",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourceDetails",
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "timestamp", order: "desc" },
    route: "ResourceDetails",
  });
  const [filter, setFilter] = useUrlStateWithFilter<ResourceLogFilter>({
    route: "ResourceDetails",
    keys: { timestamp: "DateRange" },
  });

  const { data, isSuccess, isError, error, refetch } = useGetResourceLogs({
    id: resourceId,
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const toggleActionType = (action: string) => {
    const list = toggleValueInList(action, filter.action || []);

    setFilter({
      ...filter,
      action: list.length <= 0 ? undefined : list,
    });
  };

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    return <ErrorView message={error.message} ariaLabel="ResourceLogs-Error" retry={refetch} />;
  }

  if (isSuccess) {
    return (
      <>
        <Controls
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          filter={filter}
          setFilter={setFilter}
        />
        {data.data.length <= 0 ? (
          <EmptyView
            message={words("resources.logs.empty.message")}
            aria-label="ResourceLogs-Empty"
          />
        ) : (
          <ResourceLogsTable
            logs={data.data}
            toggleActionType={toggleActionType}
            sort={sort}
            setSort={setSort}
          />
        )}
      </>
    );
  }

  return <LoadingView ariaLabel="ResourceLogs-Loading" />;
};
