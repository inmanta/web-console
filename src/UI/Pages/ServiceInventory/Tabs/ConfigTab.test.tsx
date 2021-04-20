import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CommandProviderImpl,
  DataManagerImpl,
  DataProviderImpl,
  InstanceConfigHookHelper,
  InstanceConfigStateHelper,
  ServiceKeyMaker,
  ServiceStateHelper,
} from "@/UI/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import { ConfigTab } from "./ConfigTab";
import {
  InstantFetcher,
  InstantPoster,
  Service,
  ServiceInstance,
} from "@/Test";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";

function setup() {
  const storeInstance = getStoreInstance();
  const serviceKeyMaker = new ServiceKeyMaker();

  const serviceDataManager = new DataManagerImpl<"Service">(
    new InstantFetcher<"Service">({
      kind: "Success",
      data: { data: Service.A },
    }),
    new ServiceStateHelper(storeInstance, serviceKeyMaker)
  );

  const instanceConfigStateHelper = new InstanceConfigStateHelper(
    storeInstance
  );

  const instanceConfigHelper = new InstanceConfigHookHelper(
    new InstantFetcher<"InstanceConfig">({
      kind: "Success",
      data: { data: { auto_creating: false } },
    }),
    instanceConfigStateHelper,
    serviceDataManager
  );

  const dataProvider = new DataProviderImpl([instanceConfigHelper]);

  const instanceIdentifier = {
    id: ServiceInstance.A.id,
    service_entity: Service.A.name,
    environment: Service.A.environment,
    version: ServiceInstance.A.version,
  };

  return {
    storeInstance,
    dataProvider,
    instanceConfigStateHelper,
    instanceIdentifier,
  };
}

test("ConfigTab can reset all settings", async () => {
  const {
    storeInstance,
    dataProvider,
    instanceConfigStateHelper,
    instanceIdentifier,
  } = setup();

  const commandProvider = new CommandProviderImpl(
    new InstantPoster(RemoteData.success({ data: {} })),
    instanceConfigStateHelper
  );

  render(
    <DependencyProvider dependencies={{ dataProvider, commandProvider }}>
      <StoreProvider store={storeInstance}>
        <ConfigTab serviceInstanceIdentifier={instanceIdentifier} />
      </StoreProvider>
    </DependencyProvider>
  );

  const resetButton = await screen.findByRole("button", { name: "Reset" });
  expect(resetButton).toBeVisible();

  expect(
    screen.getByRole("checkbox", { name: "auto_creating-False" })
  ).toBeVisible();

  fireEvent.click(resetButton);

  expect(
    await screen.findByRole("checkbox", { name: "auto_creating-True" })
  ).toBeVisible();
});

test("ConfigTab can change 1 toggle", async () => {
  const {
    storeInstance,
    dataProvider,
    instanceConfigStateHelper,
    instanceIdentifier,
  } = setup();

  const commandProvider = new CommandProviderImpl(
    new InstantPoster(
      RemoteData.success({
        data: { auto_creating: false, auto_designed: false },
      })
    ),
    instanceConfigStateHelper
  );

  render(
    <DependencyProvider dependencies={{ dataProvider, commandProvider }}>
      <StoreProvider store={storeInstance}>
        <ConfigTab serviceInstanceIdentifier={instanceIdentifier} />
      </StoreProvider>
    </DependencyProvider>
  );

  const toggle = await screen.findByRole("checkbox", {
    name: "auto_designed-True",
  });

  expect(toggle).toBeVisible();

  fireEvent.click(toggle);

  expect(
    await screen.findByRole("checkbox", { name: "auto_creating-False" })
  ).toBeVisible();
});
