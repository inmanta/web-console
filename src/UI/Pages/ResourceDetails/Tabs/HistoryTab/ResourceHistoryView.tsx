import React, { useContext } from "react";
import { RemoteData } from "@/Core";
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
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";

interface Props {
  resourceId: string;
}

export const ResourceHistoryView: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourceDetails",
  });
  const [sort, setSort] = useUrlStateWithSort({
    default: { name: "date", order: "desc" },
    route: "ResourceDetails",
  });
  const [data, retry] = queryResolver.useContinuous<"ResourceHistory">({
    kind: "ResourceHistory",
    id: resourceId,
    sort,
    pageSize,
  });

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="pagination">
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
          </ToolbarItem>
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
                sort={sort}
                setSort={setSort}
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
