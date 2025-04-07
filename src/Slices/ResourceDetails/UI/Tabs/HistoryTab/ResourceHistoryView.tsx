import React, { useContext, useEffect } from "react";
import {
  Divider,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { Query } from "@/Core";
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  OldPaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { ResourceHistoryTable } from "./ResourceHistoryTable";
import { ResourceTemporalData } from "./ResourceTemporalData";
import { ResourceHistoryTablePresenter } from "./TablePresenter";

interface Props {
  resourceId: string;
  details: Query.UsedApiData<"GetResourceDetails">;
}

export const ResourceHistoryView: React.FC<Props> = ({
  resourceId,
  details,
}) => {
  const { queryResolver } = useContext(DependencyContext);

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
  const [data, retry] = queryResolver.useContinuous<"GetResourceHistory">({
    kind: "GetResourceHistory",
    id: resourceId,
    sort,
    pageSize,
    currentPage,
  });

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  return (
    <Stack hasGutter>
      <StackItem>
        <ResourceTemporalData data={details} />
      </StackItem>
      <Divider />
      <StackItem isFilled>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem variant="pagination">
              <OldPaginationWidget
                data={data}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setCurrentPage={setCurrentPage}
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
              new MomentDatePresenter(),
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
      </StackItem>
    </Stack>
  );
};
