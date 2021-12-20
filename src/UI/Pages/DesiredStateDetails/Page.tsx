import React, { useContext } from "react";
import { RemoteData, Resource } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { DependencyContext } from "@/UI";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
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
    }
  );

  const [data, retry] = queryResolver.useContinuous<"GetVersionResources">({
    kind: "GetVersionResources",
    version,
    pageSize,
    filter,
    sort,
  });

  const presenter = new VersionResourceTablePresenter();

  return (
    <PageSectionWithTitle title={words("desiredState.details.title")}>
      <Controls
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        }
        filter={filter}
        setFilter={setFilter}
      />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => (
            <LoadingView aria-label="VersionResourcesTable-Loading" />
          ),
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="VersionResourcesTable-Failed"
            />
          ),
          success: (resources) =>
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
            ),
        },
        data
      )}
    </PageSectionWithTitle>
  );
};
