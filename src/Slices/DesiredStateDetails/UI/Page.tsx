import React, { useContext } from "react";
import { Resource } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { DependencyContext } from "@/UI";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Controls } from "./Controls";
import { VersionResourceTable } from "./VersionResourceTable";
import { VersionResourceTablePresenter } from "./VersionResourceTablePresenter";

export const Provider: React.FC = () => {
  const { version } = useRouteParams<"DesiredStateDetails">();
  return <Page version={version} />;
};

export const Page: React.FC<{ version: string }> = ({ version }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "DesiredStateDetails",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DesiredStateDetails",
  });
  const [sort, setSort] = useUrlStateWithSort<Resource.SortKeyFromVersion>({
    default: { name: "resource_type", order: "asc" },
    route: "DesiredStateDetails",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterFromVersion>(
    {
      route: "DesiredStateDetails",
    },
  );

  const [data, retry] = queryResolver.useContinuous<"GetVersionResources">({
    kind: "GetVersionResources",
    version,
    pageSize,
    filter,
    sort,
    currentPage,
  });

  const presenter = new VersionResourceTablePresenter();

  return (
    <PageContainer title={words("desiredState.details.title")}>
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
      <RemoteDataView
        data={data}
        retry={retry}
        label="VersionResourcesTable"
        SuccessView={(resources) =>
          resources.data.length <= 0 ? (
            <EmptyView
              message={words("resources.empty.message")}
              aria-label="VersionResourcesTable-Empty"
            />
          ) : (
            <VersionResourceTable
              aria-label="VersionResourcesTable-Success"
              version={version}
              rows={presenter.createRows(resources.data)}
              tablePresenter={new VersionResourceTablePresenter()}
              sort={sort}
              setSort={setSort}
            />
          )
        }
      />
    </PageContainer>
  );
};
