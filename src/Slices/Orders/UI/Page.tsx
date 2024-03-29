import React, { useContext } from "react";
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { SortKey } from "../Core/Query";
import { OrdersTable } from "./OrdersTable";
import { OrdersTablePresenter } from "./OrdersTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver, featureManager } = useContext(DependencyContext);

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

  const [data, retry] = queryResolver.useContinuous<"GetOrders">({
    kind: "GetOrders",
    sort,
    pageSize,
    currentPage,
  });

  const disabledOrderView = !featureManager.isOrderViewEnabled();

  return (
    <PageContainer title={words("orders.title")}>
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
      <RemoteDataView
        data={data}
        label="OrdersView"
        retry={retry}
        SuccessView={(orders) =>
          orders.data.length <= 0 || disabledOrderView ? (
            <EmptyView
              message={
                disabledOrderView
                  ? words("orders.disabled")
                  : words("orders.table.empty")
              }
              aria-label="OrdersView-Empty"
            />
          ) : (
            <div aria-label="OrdersView-Success">
              <OrdersTable
                rows={orders.data}
                tablePresenter={new OrdersTablePresenter()}
                sort={sort}
                setSort={setSort}
              />
            </div>
          )
        }
      />
    </PageContainer>
  );
};
