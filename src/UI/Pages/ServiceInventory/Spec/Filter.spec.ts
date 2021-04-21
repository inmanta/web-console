import { render, screen, act } from "@testing-library/react";
import { ServiceInstance, Pagination } from "@/Test";
import { Either } from "@/Core";

import userEvent from "@testing-library/user-event";
import { ServiceInventoryBuilder } from "./ServiceInventoryBuilder";

test("GIVEN The Service Inventory WHEN the user filters on something THEN a data update is triggered", async () => {
  const {
    component,
    serviceInstancesFetcher,
  } = new ServiceInventoryBuilder().build();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A, ServiceInstance.B],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const beforeRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(beforeRows.length).toEqual(2);

  const input = await screen.findByPlaceholderText("Select a state...");
  userEvent.click(input);

  const option = await screen.findByRole("option", { name: "creating" });
  await userEvent.click(option);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);
});
