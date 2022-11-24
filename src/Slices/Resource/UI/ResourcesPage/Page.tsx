import React, { useContext, useEffect, useState } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData, Resource } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ResourceTableControls } from "./Components";
import { ResourcesTableProvider } from "./ResourcesTableProvider";
import { Summary } from "./Summary";

export const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => (
  <PageContainer title={words("inventory.tabs.resources")}>
    {children}
  </PageContainer>
);

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Resources",
  });
  const [filter, setFilter] =
    useUrlStateWithFilter<Resource.FilterWithDefaultHandling>({
      route: "Resources",
      keys: { disregardDefault: "Boolean" },
    });
  const [sort, setSort] = useUrlStateWithSort<Resource.SortKey>({
    default: { name: "resource_type", order: "asc" },
    route: "Resources",
  });

  const filterWithDefaults =
    !filter.disregardDefault && !filter.status
      ? { ...filter, status: ["!orphaned"] }
      : filter;

  const [data, retry] = queryResolver.useContinuous<"GetResources">({
    kind: "GetResources",
    sort,
    filter: filterWithDefaults,
    pageSize,
  });

  const [staleData, setStaleData] = useState(data);

  useEffect(() => {
    if (RemoteData.isLoading(data)) return;
    setStaleData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  const updateFilter = (
    updater: (filter: Resource.Filter) => Resource.Filter
  ): void => setFilter(updater(filterWithDefaults));

  return (
    <Wrapper>
      <ResourceTableControls
        summaryWidget={<Summary data={staleData} updateFilter={updateFilter} />}
        paginationWidget={
          <PaginationWidget
            data={staleData}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        }
        filter={filterWithDefaults}
        setFilter={setFilter}
      />
      <RemoteDataView
        data={data}
        label="ResourcesView"
        retry={retry}
        SuccessView={(resources) =>
          resources.data.length <= 0 ? (
            <EmptyView
              message={words("resources.empty.message")}
              aria-label="ResourcesView-Empty"
            />
          ) : (
            <>
              <ResourcesTableProvider
                sort={sort}
                setSort={setSort}
                resources={resources.data}
                aria-label="ResourcesView-Success"
              />
              <StyledFlex justifyContent={{ default: "justifyContentFlexEnd" }}>
                <FlexItem>
                  <PaginationWidget
                    data={staleData}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                  />
                </FlexItem>
              </StyledFlex>
            </>
          )
        }
      />
    </Wrapper>
  );
};

const StyledFlex = styled(Flex)`
  padding-right: 16px;
`;
