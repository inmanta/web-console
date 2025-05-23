import React, { useEffect } from "react";
import {
  Divider,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { Details } from "@/Core/Domain/Resource/Resource";
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetResourceHistory } from "@/Data/Queries";
import { EmptyView, ErrorView, LoadingView, PaginationWidget } from "@/UI/Components";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { ResourceHistoryTable } from "./ResourceHistoryTable";
import { ResourceTemporalData } from "./ResourceTemporalData";
import { ResourceHistoryTablePresenter } from "./TablePresenter";

interface Props {
  resourceId: string;
  details: Details;
}

export const ResourceHistoryView: React.FC<Props> = ({ resourceId, details }) => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "ResourceDetails",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourceDetails",
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "date", order: "desc" },
    route: "ResourceDetails",
  });
  const { data, isSuccess, isError, error, refetch } = useGetResourceHistory({
    id: resourceId,
    sort,
    pageSize,
    currentPage,
  }).useOneTime();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    return <ErrorView message={error.message} retry={refetch} ariaLabel="ResourceHistory-Error" />;
  }
  if (isSuccess) {
    const tablePresenter = new ResourceHistoryTablePresenter(new MomentDatePresenter());
    const rows = tablePresenter.createRows(data.data);

    return (
      <Stack hasGutter>
        <StackItem>
          <ResourceTemporalData details={details} />
        </StackItem>
        <Divider />
        <StackItem isFilled>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem variant="pagination">
                <PaginationWidget
                  data={data}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  setCurrentPage={setCurrentPage}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          {data.data.length <= 0 ? (
            <EmptyView
              message={words("resources.history.empty.message")}
              aria-label="ResourceHistory-Empty"
            />
          ) : (
            <ResourceHistoryTable
              aria-label="ResourceHistory-Success"
              rows={rows}
              sort={sort}
              setSort={setSort}
              tablePresenter={tablePresenter}
            />
          )}
        </StackItem>
      </Stack>
    );
  }

  return <LoadingView ariaLabel="ResourceHistory-Loading" />;
};
