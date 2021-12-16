import React, { useContext } from "react";
import {
  RemoteData,
  VersionResourceFilter,
  VersionResourcesSortName,
} from "@/Core";
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

export const Page: React.FC = () => {
  const { version } = useRouteParams<"DesiredStateDetails">();
  return <InnerPage version={version} />;
};

const InnerPage: React.FC<{ version: string }> = ({ version }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourceDetails",
  });
  const [sort] = useUrlStateWithSort<VersionResourcesSortName>({
    default: { name: "agent", order: "desc" },
    route: "DesiredStateDetails",
  });
  const [filter, setFilter] = useUrlStateWithFilter<VersionResourceFilter>({
    route: "DesiredStateDetails",
  });

  const [data, retry] = queryResolver.useContinuous<"GetVersionResources">({
    kind: "GetVersionResources",
    version,
    pageSize,
    filter,
    sort,
  });

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
            ) : null,
        },
        data
      )}
    </PageSectionWithTitle>
  );
};
