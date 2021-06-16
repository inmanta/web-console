import React, { useContext, useState } from "react";
import { words } from "@/UI/words";
import { TableProvider } from "./TableProvider";
import {
  RemoteData,
  ServiceModel,
  ServiceInstanceParams,
  SortDirection,
} from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageTitle,
  PaginationWidget,
  ServiceProvider,
  SummaryChart,
} from "@/UI/Components";
import { TableControls } from "./Components";
import { Route } from "@/UI/Routing";
import { useParams } from "react-router-dom";
import { PageSection } from "@patternfly/react-core";
import styled from "styled-components";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection {...props} variant="light">
    <PageTitle>{words("inventory.title")}</PageTitle>
    {children}
  </PageSection>
);

export const ServiceInventoryWithProvider: React.FC = () => {
  const { service: serviceName } = useParams<Route.Params<"Inventory">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <ServiceInventory service={service} serviceName={serviceName} />
      )}
    />
  );
};

export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
}> = ({ serviceName, service }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    "created_at"
  );
  const [order, setOrder] = useState<SortDirection | undefined>("desc");
  const sort =
    sortColumn && order ? { name: sortColumn, order: order } : undefined;
  const [filter, setFilter] = useState<ServiceInstanceParams.Filter>({});

  const [data, retry] = queryResolver.useContinuous<"ServiceInstances">({
    kind: "ServiceInstances",
    name: serviceName,
    sort,
    filter,
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
          pageSize={20}
        />
      ),
    },
    data
  );

  return (
    <Wrapper>
      {service.instance_summary && (
        <ChartContainer>
          <SummaryChart
            by_label={service.instance_summary.by_label}
            total={service.instance_summary.total}
          />
        </ChartContainer>
      )}
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
