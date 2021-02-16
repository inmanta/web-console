import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { StaticSubscriptionController, DeferredApiHelper } from "@/Test";
import { Either } from "@/Core";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  ResourcesStateHelper,
  ResourcesEntityManager,
  ResourcesHookHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ResourcesView } from "./ResourcesView";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const subscriptionController = new StaticSubscriptionController();
  const dataManager = new DataProviderImpl([
    new ResourcesHookHelper(
      new ResourcesEntityManager(apiHelper, new ResourcesStateHelper(store)),
      subscriptionController
    ),
  ]);

  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };

  const component = (
    <ServicesContext.Provider value={{ dataManager }}>
      <StoreProvider store={store}>
        <ResourcesView qualifier={instance} title="" icon={<></>} />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  return { component, apiHelper, subscriptionController };
}

test("ResourcesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right([]));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Empty" })
  ).toBeInTheDocument();
});

test("ResourcesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Failed" })
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right([{ resource_id: "abc123", resource_state: "deployed" }])
  );

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
  ).toBeInTheDocument();
});

test("ResourcesView shows updated table", async () => {
  const { component, apiHelper, subscriptionController } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right([]));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Empty" })
  ).toBeInTheDocument();

  subscriptionController.executeAll();

  apiHelper.resolve(
    Either.right([{ resource_id: "abc123", resource_state: "deployed" }])
  );

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
  ).toBeInTheDocument();
});
