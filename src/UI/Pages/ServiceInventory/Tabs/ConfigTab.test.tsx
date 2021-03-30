import React from "react";
import { render, screen } from "@testing-library/react";
import { BaseApiHelper } from "@/Infra";
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
import { InstantFetcher, Service, ServiceInstance } from "@/Test";
import { StoreProvider } from "easy-peasy";

test("ConfigTab can reset all settings", async () => {
  const storeInstance = getStoreInstance();
  const baseApiHelper = new BaseApiHelper(undefined);
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
    baseApiHelper,
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

  const toggle = screen.getByRole("checkbox", {
    name: "auto_creating-False",
  });

  expect(toggle).toBeVisible();
});
