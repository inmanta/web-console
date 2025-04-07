import React, { useContext } from 'react';
import { useRouteParams } from '@/UI';
import { EmptyView, PageContainer, RemoteDataView } from '@/UI/Components';
import { DependencyContext } from '@/UI/Dependency';
import { words } from '@/UI/words';
import { OrderDetailsHeading } from './OrderDetailsHeading';
import { OrderDetailsTable } from './OrderDetailsTable';
import { OrderDetailsTablePresenter } from './OrderDetailsTablePresenter';

export const Page: React.FC = () => {
  const { queryResolver, featureManager } = useContext(DependencyContext);
  const { id } = useRouteParams<'OrderDetails'>();

  const [data, retry] = queryResolver.useContinuous<'GetOrderDetails'>({
    kind: 'GetOrderDetails',
    id: id,
  });

  const disabledOrderDetailsView = !featureManager.isOrderViewEnabled();

  return (
    <PageContainer pageTitle={words('ordersDetails.title')}>
      <RemoteDataView
        data={data}
        label="OrderDetailsView"
        retry={retry}
        SuccessView={(orderDetails) =>
          !orderDetails.data || disabledOrderDetailsView ? (
            <EmptyView
              message={
                disabledOrderDetailsView
                  ? words('orders.disabled')
                  : words('orderDetails.table.empty')
              }
              aria-label="OrderDetailsView-Empty"
            />
          ) : (
            <div aria-label="OrderDetailsView-Success">
              <OrderDetailsHeading serviceOrder={orderDetails.data} />
              <OrderDetailsTable
                rows={orderDetails.data.service_order_items}
                tablePresenter={new OrderDetailsTablePresenter()}
              />
            </div>
          )
        }
      />
    </PageContainer>
  );
};
