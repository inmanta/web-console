import React, { useContext, useEffect } from "react";
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetOrders } from "@/Data/Queries";
import {
  EmptyView,
  PageContainer,
  LoadingView,
  PaginationWidget,
  ErrorView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { SortKey } from "../Core/Types";
import { OrdersTable } from "./OrdersTable";
import { OrdersTablePresenter } from "./OrdersTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { orchestratorProvider } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Orders",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Orders",
  });

  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "created_at", order: "desc" },
    route: "Orders",
  });
  const { data, isSuccess, isError, error, refetch } = useGetOrders().useContinuous({
    sort,
    pageSize,
    currentPage,
  });

  const disabledOrderView = !orchestratorProvider.isOrderViewEnabled();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    return (
      <PageContainer pageTitle={words("orders.title")}>
        <ErrorView ariaLabel="OrdersView-Error" retry={refetch} message={error.message} />;
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("orders.title")}>
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
          <div aria-label="OrdersView-Success">
            <OrdersTable
              rows={data.data}
              tablePresenter={new OrdersTablePresenter()}
              sort={sort}
              setSort={setSort}
            />
          </div>
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
