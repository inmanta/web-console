import React, { useContext } from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
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
    url: `/lsm/v1/service_inventory/service/abc/resources?current_version=${version}`,
    environment: "env",
  });

  const instanceRequest = () => ({
    method: "GET",
    url: "/lsm/v1/service_inventory/service/abc",
    environment: "env",
  });

  return { component, apiHelper, resourcesRequest, instanceRequest };
}

const Component: React.FC = ({}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetInstanceResources">({
    kind: "GetInstanceResources",
    id: "abc",
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

test("Given the InstanceResourcesQueryManager When used Then handles 409", async () => {
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
});
