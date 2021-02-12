import React from "react";
import { render, screen } from "@testing-library/react";
import { ResourcesView } from "./ResourcesView";
import { StaticSubscriptionController, DeferredApiHelper } from "@/Test";
import { ServicesContext } from "../ServicesContext";
import { DataManagerImpl } from "../Data/DataManagerImpl";
import { getStoreInstance } from "../Store";
import { StoreProvider } from "easy-peasy";
import { ResourcesStateHelper } from "../Data/ResourcesStateHelper";
import { ResourcesEntityManager } from "../Data";
import { Either } from "@/Core";

test("ResourcesView shows empty table", async () => {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const dataManager = new DataManagerImpl(
    new ResourcesEntityManager(apiHelper, new ResourcesStateHelper(store)),
    new StaticSubscriptionController()
  );

  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };

  render(
    <ServicesContext.Provider value={{ dataManager }}>
      <StoreProvider store={store}>
        <ResourcesView qualifier={instance} title="" icon={<></>} />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right([]));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Empty" })
  ).toBeInTheDocument();
});

test("ResourcesView shows failed table", async () => {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const dataManager = new DataManagerImpl(
    new ResourcesEntityManager(apiHelper, new ResourcesStateHelper(store)),
    new StaticSubscriptionController()
  );

  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };

  render(
    <ServicesContext.Provider value={{ dataManager }}>
      <StoreProvider store={store}>
        <ResourcesView qualifier={instance} title="" icon={<></>} />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Failed" })
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const dataManager = new DataManagerImpl(
    new ResourcesEntityManager(apiHelper, new ResourcesStateHelper(store)),
    new StaticSubscriptionController()
  );

  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };

  render(
    <ServicesContext.Provider value={{ dataManager }}>
      <StoreProvider store={store}>
        <ResourcesView qualifier={instance} title="" icon={<></>} />
      </StoreProvider>
    </ServicesContext.Provider>
  );

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
