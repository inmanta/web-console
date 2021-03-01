import React from "react";
import { render, screen } from "@testing-library/react";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { ServiceInstance } from "@/Test";

it("ServiceInstanceHistory renders", async () => {
  const { service_entity, id, environment } = ServiceInstance.A;
  render(
    <ServiceInstanceHistory
      serviceId={service_entity}
      instanceId={id}
      env={environment}
    />
  );
  expect(
    screen.getByRole("generic", { name: "ServiceInstanceHistory" })
  ).toBeVisible();
});
