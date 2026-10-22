import React, { useContext } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { words } from "@/Core";
import { usePaginatedTable } from "@/Data/Common";
import { useGetOrders } from "@/Data/Queries/Slices/Order";
import { EmptyView } from "@/UI/Components/EmptyView";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { PageContainer } from "@/UI/Components/PageContainer";
import { PaginationWidget } from "@/UI/Components/PaginationWidget";
import { DependencyContext } from "@/UI/Dependency";
import { SortKey } from "../Core/Types";
import { OrdersTable } from "./OrdersTable";
import { createOrdersTablePresenter } from "./OrdersTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { orchestratorProvider } = useContext(DependencyContext);
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort } = usePaginatedTable<
    undefined,
    SortKey
  >({
    route: "Orders",
    defaultSort: { name: "created_at", order: "desc" },
  });

  const { data, isSuccess, isError, error, refetch } = useGetOrders().useContinuous({
    sort,
    pageSize,
    currentPage,
  });

  const disabledOrderView = !orchestratorProvider.isOrderViewEnabled();

  if (isError) {
    return (
      <PageContainer pageTitle={words("orders.title")}>
        <ErrorView ariaLabel="OrdersView-Error" retry={refetch} message={error.message} />;
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer
        pageTitle={words("orders.title")}
        style={{ display: "flex", flexDirection: "column" }}
      >
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
        {data.data.length <= 0 || disabledOrderView ? (
          <EmptyView
            message={disabledOrderView ? words("orders.disabled") : words("orders.table.empty")}
            aria-label="OrdersView-Empty"
          />
        ) : (
          <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
            <StackItem
              isFilled
              style={{ minHeight: 0, height: "100%", overflow: "auto" }}
              aria-label="OrdersView-Success"
            >
              <OrdersTable
                rows={data.data}
                tablePresenter={createOrdersTablePresenter()}
                sort={sort}
                setSort={setSort}
              />
            </StackItem>
          </Stack>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("orders.title")}>
      <LoadingView ariaLabel="OrdersView-Loading" />
    </PageContainer>
  );
};
