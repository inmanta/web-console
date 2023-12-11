import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Either } from "@/Core";
import { ServiceInstance, Pagination } from "@/Test";
import { words } from "@/UI";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on something THEN a data update is triggered", async () => {
  const { component, apiHelper } = new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      }),
    );
  });

  const beforeRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(beforeRows.length).toEqual(2);

  const input = await screen.findByPlaceholderText(
    words("inventory.filters.state.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });

  const option = await screen.findByRole("option", {
    name: `${words("inventory.test.creating")}`,
  });
  await act(async () => {
    await userEvent.click(option);
  });

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a],
        links: Pagination.links,
        metadata: Pagination.metadata,
      }),
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);
});
