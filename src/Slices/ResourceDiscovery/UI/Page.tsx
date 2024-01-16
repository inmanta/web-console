import React, { useContext } from "react";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter, SortKey } from "@S/ResourceDiscovery/Core/Query";
import { DiscoveredResourcesTable } from "./DiscoveredResourcesTable";
import { DiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "DiscoveredResources",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DiscoveredResources",
  });
  // The filters are currently empty, but can easily be added at a later stage when the endpoint supports it.
  const [filter, _setFilter] = useUrlStateWithFilter<Filter>({
    route: "DiscoveredResources",
  });
  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "discovered_resource_id", order: "asc" },
    route: "DiscoveredResources",
  });

  const [data, retry] = queryResolver.useContinuous<"GetDiscoveredResources">({
    kind: "GetDiscoveredResources",
    sort,
    filter,
    pageSize,
    currentPage,
  });

  return (
    <PageContainer title={words("discovered_resources.title")}>
      <TableControls
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        }
      />
      <RemoteDataView
        data={data}
        label="DiscoveredResourcesView"
        retry={retry}
        SuccessView={(resources) =>
          resources.data.length <= 0 ? (
            <EmptyView
              message={words("resources.empty.message")}
              aria-label="ResourcesView-Empty"
            />
          ) : (
            <DiscoveredResourcesTable
              rows={resources.data}
              aria-label="DiscoveredResourcesView-Success"
              tablePresenter={new DiscoveredResourcesTablePresenter()}
              sort={sort}
              setSort={setSort}
            />
          )
        }
      />
    </PageContainer>
  );
};
