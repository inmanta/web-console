import React, { useContext, useState, ReactElement } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { words } from "@/UI/words";
import { TableProvider } from "./TableProvider";
import {
  RemoteData,
  ServiceModel,
  ServiceInstanceParams,
  SortDirection,
  PageSize,
} from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
  ServiceProvider,
  SummaryChart,
} from "@/UI/Components";
import { TableControls } from "./Components";
import { Route } from "@/UI/Routing";
import { useUrlState } from "@/Data";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("inventory.title")}>
    {children}
  </PageSectionWithTitle>
);

export const ServiceInventoryWithProvider: React.FC = () => {
  const { service: serviceName } = useParams<Route.Params<"Inventory">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <ServiceInventory
          service={service}
          serviceName={serviceName}
          intro={
            service.instance_summary ? (
              <ChartContainer>
                <SummaryChart
                  by_label={service.instance_summary.by_label}
                  total={service.instance_summary.total}
                />
              </ChartContainer>
            ) : null
          }
        />
      )}
    />
  );
};

export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
  intro: ReactElement | null;
}> = ({ serviceName, service, intro }) => {
  // Hook 1
  const { queryResolver } = useContext(DependencyContext);

  // Hook 2
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    "created_at"
  );

  // const [sortColumn, setSortColumn] = useUrlState<string | undefined>({
  //   default: "created_at",
  //   key: "sortColumn",
  //   validator: (v): v is string => typeof v === "string",
  // });

  // const [pageSize, setPageSize] = useState(PageSize.initial);

  // Hook 3 & 4
  const [pageSize, setPageSize] = useUrlState({
    default: PageSize.initial,
    key: "pageSize",
    validator: PageSize.is,
    serialize: PageSize.serialize,
    parse: PageSize.parse,
    equals: PageSize.equals,
  });
  // Hook 5
  const [order, setOrder] = useState<SortDirection | undefined>("desc");
  console.log({ order });
  const sort =
    sortColumn && order ? { name: sortColumn, order: order } : undefined;

  // Hook 6
  const [filter, setFilter] = useState<ServiceInstanceParams.Filter>({});

  // Hook 7 - 15
  const [data, retry] = queryResolver.useContinuous<"ServiceInstances">({
    kind: "ServiceInstances",
    name: serviceName,
    sort,
    filter,
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
    <Wrapper>
      {intro}
      <TableControls
        serviceName={serviceName}
        filter={filter}
        setFilter={setFilter}
        service={service}
        paginationWidget={paginationWidget}
      />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="ServiceInventory-Loading" />,
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="ServiceInventory-Failed"
            />
          ),
          success: ({ data: instances }) =>
            instances.length > 0 ? (
              <TableProvider
                aria-label="ServiceInventory-Success"
                instances={instances}
                serviceEntity={service}
                sortColumn={sortColumn}
                setSortColumn={setSortColumn}
                order={order}
                setOrder={setOrder}
              />
            ) : (
              <EmptyView
                message={words("inventory.empty.message")(serviceName)}
                aria-label="ServiceInventory-Empty"
              />
            ),
        },
        data
      )}
    </Wrapper>
  );
};

const ChartContainer = styled.div`
  height: 230px;
  width: 350px;
`;
