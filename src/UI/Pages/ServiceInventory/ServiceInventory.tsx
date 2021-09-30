import React, { useContext, ReactElement } from "react";
import { useParams } from "react-router-dom";
import { words } from "@/UI/words";
import { TableProvider } from "./TableProvider";
import {
  RemoteData,
  ServiceModel,
  ServiceInstanceParams,
  PageSize,
  Sort,
  isObject,
} from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
  ServiceProvider,
} from "@/UI/Components";
import { Chart, TableControls } from "./Components";
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

  const [sort, setSort] = useUrlState<Sort.Type>({
    default: { name: "created_at", direction: "desc" },
    key: "sort",
    validator: Sort.is,
    serialize: Sort.serialize,
    parse: Sort.parse,
    equals: Sort.equals,
  });

  const [pageSize, setPageSize] = useUrlState({
    default: PageSize.initial,
    key: "pageSize",
    validator: PageSize.is,
    serialize: PageSize.serialize,
    parse: PageSize.parse,
    equals: PageSize.equals,
  });

  const [filter, setFilter] = useUrlState<ServiceInstanceParams.Filter>({
    default: {},
    key: "filter",
    validator: (v: unknown): v is ServiceInstanceParams.Filter => isObject(v),
  });

  const [data, retry] = queryResolver.useContinuous<"ServiceInstances">({
    kind: "ServiceInstances",
    name: serviceName,
    sort: { name: sort.name, order: sort.direction },
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
