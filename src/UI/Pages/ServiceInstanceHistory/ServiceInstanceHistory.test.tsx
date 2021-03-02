import React from "react";
import { render, screen } from "@testing-library/react";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { ServiceInstance } from "@/Test";
import { DataProviderImpl } from "@/UI/Data";
import { ServicesContext } from "@/UI/ServicesContext";

it.skip("ServiceInstanceHistory renders", async () => {
  const { service_entity, id, environment } = ServiceInstance.A;
  const dataProvider = new DataProviderImpl([]);

  render(
    <ServicesContext.Provider value={{ dataProvider }}>
      <ServiceInstanceHistory
        service_entity={service_entity}
        instanceId={id}
        environment={environment}
      />
    </ServicesContext.Provider>
  );
  expect(
    screen.getByRole("generic", { name: "ServiceInstanceHistory" })
  ).toBeVisible();
});
