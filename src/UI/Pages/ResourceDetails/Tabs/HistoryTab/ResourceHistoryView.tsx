import React, { useContext } from "react";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { EmptyView, PaginationWidget, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { ResourceHistoryTable } from "./ResourceHistoryTable";
import { ResourceHistoryTablePresenter } from "./TablePresenter";

interface Props {
  resourceId: string;
}

export const ResourceHistoryView: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourceDetails",
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "date", order: "desc" },
    route: "ResourceDetails",
  });
  const [data, retry] = queryResolver.useContinuous<"GetResourceHistory">({
    kind: "GetResourceHistory",
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
      <RemoteDataView
        data={data}
        retry={retry}
        label="ResourceHistory"
        SuccessView={(history) => {
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
        }}
      />
    </>
  );
};
