import React, { useContext } from "react";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useGetOrderDetails } from "@inmanta/web-console-core/Queries/Slices/Order";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { OrderDetailsHeading } from "./OrderDetailsHeading";
import { OrderDetailsTable } from "./OrderDetailsTable";
import { createOrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

export const Page: React.FC = () => {
  const { orchestratorProvider } = useContext(DependencyContext);
  const { id } = useRouteParams<"OrderDetails">();

  const { data, isSuccess, isError, error, refetch } = useGetOrderDetails().useContinuous(id);

  const disabledOrderDetailsView = !orchestratorProvider.isOrderViewEnabled();

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
              tablePresenter={createOrderDetailsTablePresenter()}
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
