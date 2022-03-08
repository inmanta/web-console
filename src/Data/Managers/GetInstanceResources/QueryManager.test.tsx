import React, { useContext } from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either, PageSize, RemoteData } from "@/Core";
import { QueryManagerResolver, QueryResolverImpl } from "@/Data/Resolvers";
import { getStoreInstance } from "@/Data/Store";
import {
  DeferredApiHelper,
  dependencies,
  InstanceResource,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { DependencyContext, DependencyProvider } from "@/UI";
import { RemoteDataView } from "@/UI/Components";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler, 2)
  );
  const component = (
    <StoreProvider store={store}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <Component />
      </DependencyProvider>
    </StoreProvider>
  );

  const resourcesRequest = (version) => ({
    method: "GET",
    url: `/lsm/v1/service_inventory/service/${ServiceInstance.a.id}/resources?current_version=${version}`,
    environment: "env",
  });

  const instanceRequest = () => ({
    method: "GET",
    url: `/lsm/v1/service_inventory/service/${ServiceInstance.a.id}`,
    environment: "env",
  });

  return {
    component,
    apiHelper,
    resourcesRequest,
    instanceRequest,
    scheduler,
    store,
  };
}

const Component: React.FC = ({}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetInstanceResources">({
    kind: "GetInstanceResources",
    id: ServiceInstance.a.id,
    service_entity: "service",
    version: 1,
  });
  return (
    <RemoteDataView
      label="Dummy"
      data={data}
      SuccessView={() => <div aria-label="Dummy-Success">success</div>}
    />
  );
};

test("Given the InstanceResourcesQueryManager When initial request fails with 409 Then requests are retried", async () => {
  const { component, apiHelper, resourcesRequest, instanceRequest } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" })
  ).toBeVisible();

  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: { ...ServiceInstance.a, version: 2 } })
    );
  });
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(2)]);
  await act(async () => {
    apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Success" })
  ).toBeVisible();
});

test("Given the InstanceResourcesQueryManager When instance fails Then error is shown", async () => {
  const { component, apiHelper, resourcesRequest, instanceRequest } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" })
  ).toBeVisible();

  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(async () => {
    apiHelper.resolve(Either.left("error"));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Failed" })
  ).toBeVisible();
});

test("Given the InstanceResourcesQueryManager When it keeps failing Then it stops at the runsLimit", async () => {
  const { component, apiHelper, resourcesRequest, instanceRequest } = setup();
  render(component);

  // 1st resources
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" })
  ).toBeVisible();

  // 1st instance
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: { ...ServiceInstance.a, version: 2 } })
    );
  });

  // 2nd resources
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(2)]);
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });

  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" })
  ).toBeVisible();

  // 2nd instance
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: { ...ServiceInstance.a, version: 3 } })
    );
  });

  // 3rd resources
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(3)]);
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Failed" })
  ).toBeVisible();
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the InstanceResourcesQueryManager Then a task is registered on the scheduler", async () => {
  const { component, apiHelper, resourcesRequest, instanceRequest, scheduler } =
    setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(async () => {
    apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });
  expect(scheduler.getIds()).toEqual([
    `GetInstanceResources_${ServiceInstance.a.id}`,
  ]);

  scheduler.executeAll();
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(scheduler.getIds()).toEqual([
    `GetInstanceResources_${ServiceInstance.a.id}`,
  ]);
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
});

test.only("Given the InstanceResourcesQueryManager When instance call is successful Then the store is updated", async () => {
  const { component, store, apiHelper, instanceRequest } = setup();
  render(component);
  store.dispatch.serviceInstances.setData({
    query: {
      kind: "GetServiceInstances",
      name: "service",
      pageSize: PageSize.initial,
    },
    value: RemoteData.success({
      data: [ServiceInstance.a, ServiceInstance.b],
      links: { self: "self" },
      metadata: { before: 0, after: 0, page_size: 20, total: 2 },
    }),
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: { ...ServiceInstance.a, version: 4 } })
    );
  });
  await act(async () => {
    apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });
  const services = store.getState().serviceInstances.byId[`env__?__service`];
  if (!RemoteData.isSuccess(services)) {
    fail();
  }

  const instance = services.value.data.find(
    (instance) => instance.id === ServiceInstance.a.id
  );
  expect(instance).not.toBeUndefined();
  expect(instance?.version).toEqual(4);
});
