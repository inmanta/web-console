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
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const component = (
    <StoreProvider store={store}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <Dummy />
      </DependencyProvider>
    </StoreProvider>
  );

  return { component, apiHelper };
}

const Dummy: React.FC = ({}) => {
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

test("Given the InstanceResourceQueryManager When used Then handles 409", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v1/service_inventory/service/abc/resources?current_version=1",
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(Either.left({ status: 409, message: "conflict" }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Loading" })
  ).toBeVisible();
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v1/service_inventory/service/abc",
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: { ...ServiceInstance.a, version: 2 } })
    );
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v1/service_inventory/service/abc/resources?current_version=2",
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });
  expect(
    await screen.findByRole("generic", { name: "Dummy-Success" })
  ).toBeVisible();
});
