import React, { useContext, useState } from "react";
import { RemoteData, SortDirection } from "@/Core";
import { ResourceHistoryTablePresenter } from "./TablePresenter";
import { MomentDatePresenter } from "@/UI/Utils";
import { ResourceHistoryTable } from "./ResourceHistoryTable";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PaginationWidget,
} from "@/UI/Components";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  resourceId: string;
}

export const ResourceHistoryView: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useState(20);
  const [order, setOrder] = useState<SortDirection>("desc");
  const sort = order ? { name: "date", order: order } : undefined;
  const [data, retry] = queryResolver.useContinuous<"ResourceHistory">({
    kind: "ResourceHistory",
    id: resourceId,
    sort,
    pageSize,
  });

  const paginationWidget = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: ({ handlers, metadata }) => (
        <PaginationWidget
          handlers={handlers}
          metadata={metadata}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      ),
    },
    data
  );
  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="ResourceHistory-Loading" />,
          failed: (error) => (
            <ErrorView
              retry={retry}
              title={words("resources.history.failed.title")}
              message={words("resources.history.failed.body")(error)}
              aria-label="ResourceHistory-Failed"
            />
          ),
          success: (history) => {
            if (history.data.length <= 0) {
              return (
                <EmptyView
                  message={words("resources.history.empty.message")}
                  aria-label="ResourceHistory-Empty"
                />
              );
            }
            const tablePresenter = new ResourceHistoryTablePresenter(
              new MomentDatePresenter()
            );
            const rows = tablePresenter.createRows(history.data);
            return (
              <ResourceHistoryTable
                aria-label="ResourceHistory-Success"
                rows={rows}
                order={order}
                setOrder={setOrder}
                tablePresenter={tablePresenter}
              />
            );
          },
        },
        data
      )}
    </>
  );
};
