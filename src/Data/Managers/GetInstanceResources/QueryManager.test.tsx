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
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler, 2),
  );
  const component = (
    <StoreProvider store={store}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <Component />
      </DependencyProvider>
    </StoreProvider>
  );

  const instanceA = {
    ...ServiceInstance.a,
    instanceSetStateTargets: [],
  };

  const instanceB = {
    ...ServiceInstance.b,
    instanceSetStateTargets: [],
  };

  const resourcesRequest = (version) => ({
    method: "GET",
    url: `/lsm/v1/service_inventory/service/${instanceA.id}/resources?current_version=${version}`,
    environment: "env",
  });

  const instanceRequest = () => ({
    method: "GET",
    url: `/lsm/v1/service_inventory/service/${instanceA.id}`,
    environment: "env",
  });

  const resolveAs = {
    resourcesConflict: async () => {
      apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
    },
    resourcesSuccess: async () => {
      apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
    },
    instanceSuccess: (version: number) => async () => {
      apiHelper.resolve(Either.right({ data: { ...instanceA, version } }));
    },
    error: async () => {
      apiHelper.resolve(Either.left("error"));
    },
  };

  return {
    component,
    apiHelper,
    resourcesRequest,
    instanceRequest,
    scheduler,
    store,
    resolveAs,
    instanceA,
    instanceB,
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
  const { component, apiHelper, resourcesRequest, instanceRequest, resolveAs } =
    setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(resolveAs.resourcesConflict);
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" }),
  ).toBeVisible();

  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(resolveAs.instanceSuccess(2));
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(2)]);
  await act(resolveAs.resourcesSuccess);
  expect(
    await screen.findByRole("generic", { name: "Dummy-Success" }),
  ).toBeVisible();
});

test("Given the InstanceResourcesQueryManager When instance fails Then error is shown", async () => {
  const { component, apiHelper, resourcesRequest, instanceRequest, resolveAs } =
    setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(resolveAs.resourcesConflict);
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" }),
  ).toBeVisible();

  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(resolveAs.error);
  expect(
    await screen.findByRole("generic", { name: "Dummy-Failed" }),
  ).toBeVisible();
});

test("Given the InstanceResourcesQueryManager When it keeps failing Then it stops at the retryLimit", async () => {
  const { component, apiHelper, resourcesRequest, instanceRequest, resolveAs } =
    setup();
  render(component);

  // 1st resources
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(resolveAs.resourcesConflict);
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" }),
  ).toBeVisible();

  // 1st instance
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(resolveAs.instanceSuccess(2));

  // 2nd resources
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(2)]);
  await act(resolveAs.resourcesConflict);

  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" }),
  ).toBeVisible();

  // 2nd instance
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(resolveAs.instanceSuccess(3));

  // 3rd resources
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(3)]);
  await act(resolveAs.resourcesConflict);
  expect(
    await screen.findByRole("generic", { name: "Dummy-Failed" }),
  ).toBeVisible();
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the InstanceResourcesQueryManager Then a task is registered on the scheduler", async () => {
  const {
    component,
    apiHelper,
    resourcesRequest,
    instanceRequest,
    scheduler,
    resolveAs,
    instanceA,
  } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(resolveAs.resourcesSuccess);
  expect(scheduler.getIds()).toEqual([`GetInstanceResources_${instanceA.id}`]);

  scheduler.executeAll();
  expect(apiHelper.pendingRequests).toEqual([resourcesRequest(1)]);
  await act(resolveAs.resourcesConflict);
  expect(scheduler.getIds()).toEqual([`GetInstanceResources_${instanceA.id}`]);
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
});

test("Given the InstanceResourcesQueryManager When instance call is successful Then the store is updated", async () => {
  const {
    component,
    store,
    apiHelper,
    instanceRequest,
    resolveAs,
    instanceA,
    instanceB,
  } = setup();
  render(component);
  store.dispatch.serviceInstances.setData({
    query: {
      kind: "GetServiceInstances",
      name: "service",
      pageSize: PageSize.initial,
    },
    value: RemoteData.success({
      data: [instanceA, instanceB],
      links: { self: "self" },
      metadata: { before: 0, after: 0, page_size: 20, total: 2 },
    }),
    environment: "env",
  });
  await act(resolveAs.resourcesConflict);
  expect(apiHelper.pendingRequests).toEqual([instanceRequest()]);
  await act(resolveAs.instanceSuccess(4));
  await act(resolveAs.resourcesSuccess);
  const services = store.getState().serviceInstances.byId[`env__?__service`];
  if (!RemoteData.isSuccess(services)) fail();

  const instance = services.value.data.find(
    (instance) => instance.id === instanceA.id,
  );
  expect(instance).not.toBeUndefined();
  expect(instance).toEqual({ ...instanceA, version: 4 });
});

test("Given the InstanceResourcesQueryManager When scheduled instance call is successful Then the store is updated", async () => {
  const { component, store, resolveAs, scheduler, instanceA, instanceB } =
    setup();
  render(component);
  store.dispatch.serviceInstances.setData({
    query: {
      kind: "GetServiceInstances",
      name: "service",
      pageSize: PageSize.initial,
    },
    value: RemoteData.success({
      data: [instanceA, instanceB],
      links: { self: "self" },
      metadata: { before: 0, after: 0, page_size: 20, total: 2 },
    }),
    environment: "env",
  });

  await act(resolveAs.resourcesSuccess);
  scheduler.executeAll();
  await act(resolveAs.resourcesConflict);
  await act(resolveAs.instanceSuccess(4));
  await act(resolveAs.resourcesSuccess);

  const services = store.getState().serviceInstances.byId[`env__?__service`];
  if (!RemoteData.isSuccess(services)) {
    fail();
  }

  const a = services.value.data.find(
    (instance) => instance.id === instanceA.id,
  );
  expect(a).not.toBeUndefined();
  expect(a).toEqual({ ...instanceA, version: 4 });

  const b = services.value.data.find(
    (instance) => instance.id === instanceB.id,
  );
  expect(b).not.toBeUndefined();
  expect(b).toEqual(instanceB);
});
