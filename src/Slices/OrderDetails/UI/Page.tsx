import React, { useContext } from "react";
import { useGetOrderDetails } from "@/Data/Queries/Slices/Order";
import { EmptyView, ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { OrderDetailsHeading } from "./OrderDetailsHeading";
import { OrderDetailsTable } from "./OrderDetailsTable";
import { OrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

export const Page: React.FC = () => {
  const { featureManager } = useContext(DependencyContext);
  const { id } = useRouteParams<"OrderDetails">();

  const { data, isSuccess, isError, error, refetch } = useGetOrderDetails().useContinuous(id);

  const disabledOrderDetailsView = !featureManager.isOrderViewEnabled();

  if (isError) {
    return (
      <PageContainer pageTitle={words("ordersDetails.title")}>
        <ErrorView message={error.message} ariaLabel="OrderDetailsView-Error" retry={refetch} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("ordersDetails.title")}>
        {!data || disabledOrderDetailsView ? (
          <EmptyView
            message={
              disabledOrderDetailsView
                ? words("orders.disabled")
                : words("orderDetails.table.empty")
            }
            aria-label="OrderDetailsView-Empty"
          />
        ) : (
          <div aria-label="OrderDetailsView-Success">
            <OrderDetailsHeading serviceOrder={data} />
            <OrderDetailsTable
              rows={data.service_order_items}
              tablePresenter={new OrderDetailsTablePresenter()}
            />
          </div>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("ordersDetails.title")}>
      <LoadingView ariaLabel="OrderDetailsView-Loading" />
    </PageContainer>
  );
};
