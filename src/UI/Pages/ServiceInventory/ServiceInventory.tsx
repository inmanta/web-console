import React, { useContext, ReactElement } from "react";
import { RemoteData, ServiceModel, ServiceInstanceParams } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
  ServiceProvider,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Chart, TableControls } from "./Components";
import { TableProvider } from "./TableProvider";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("inventory.title")}>
    {children}
  </PageSectionWithTitle>
);

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"Inventory">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={PreppedServiceInventory}
    />
  );
};

const PreppedServiceInventory: React.FC<{ service: ServiceModel }> = ({
  service,
}) => (
  <ServiceInventory
    service={service}
    serviceName={service.name}
    intro={<Chart summary={service.instance_summary} />}
  />
);

export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
  intro?: ReactElement | null;
}> = ({ serviceName, service, intro }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "created_at", order: "desc" },
    route: "Inventory",
  });

  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Inventory",
  });

  const [filter, setFilter] =
    useUrlStateWithFilter<ServiceInstanceParams.Filter>({ route: "Inventory" });

  const [data, retry] = queryResolver.useContinuous<"GetServiceInstances">({
    kind: "GetServiceInstances",
    name: serviceName,
    sort,
    filter,
    pageSize,
  });

  return (
    <Wrapper>
      {intro}
      <TableControls
        serviceName={serviceName}
        filter={filter}
        setFilter={setFilter}
        service={service}
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        }
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
                sort={sort}
                setSort={setSort}
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
