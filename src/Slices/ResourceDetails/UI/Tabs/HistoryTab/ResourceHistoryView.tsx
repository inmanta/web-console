import React from "react";
import {
  Divider,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { Details } from "@inmanta/web-console-core/Domain/Resource/Resource";
import { useGetResourceHistory } from "@inmanta/web-console-core/Queries/Slices/Resource";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { ResourceHistoryTable } from "./ResourceHistoryTable";
import { ResourceTemporalData } from "./ResourceTemporalData";
import { createResourceHistoryTablePresenter } from "./TablePresenter";

interface Props {
  resourceId: string;
  details: Details;
}

export const ResourceHistoryView: React.FC<Props> = ({ resourceId, details }) => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort } =
    usePaginatedTable<undefined>({
      route: "ResourceDetails",
      defaultSort: { name: "date", order: "desc" },
    });

  const { data, isSuccess, isError, error, refetch } = useGetResourceHistory({
    id: resourceId,
    sort,
    pageSize,
    currentPage,
  }).useOneTime();

  if (isError) {
    return <ErrorView message={error.message} retry={refetch} ariaLabel="ResourceHistory-Error" />;
  }
  if (isSuccess) {
    const tablePresenter = createResourceHistoryTablePresenter();
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
