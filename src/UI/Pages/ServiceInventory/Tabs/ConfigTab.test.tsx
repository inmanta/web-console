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

test("ConfigTab can reset all settings", async () => {
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
    new DataManagerImpl<"InstanceConfig">(
      new InstantFetcher<"InstanceConfig">({
        kind: "Success",
        data: { data: { auto_creating: false } },
      }),
      instanceConfigStateHelper
    ),
    serviceDataManager
  );

  const dataProvider = new DataProviderImpl([instanceConfigHelper]);

  const commandProvider = new CommandProviderImpl(
    new InstantPoster(RemoteData.success({ data: {} })),
    instanceConfigStateHelper
  );

  const instanceIdentifier = {
    id: ServiceInstance.A.id,
    service_entity: Service.A.name,
    environment: Service.A.environment,
    version: ServiceInstance.A.version,
  };

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
