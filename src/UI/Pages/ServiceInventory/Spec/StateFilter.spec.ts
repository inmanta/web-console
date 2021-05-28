import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { Either } from "@/Core";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on state ('creating') THEN only that type of instance is fetched and shown", async () => {
  const { component, serviceInstancesFetcher } =
    new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(initialRows.length).toEqual(2);

  const input = await screen.findByPlaceholderText("Select a state...");
  userEvent.click(input);

  const option = await screen.findByRole("option", { name: "creating" });
  await userEvent.click(option);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.a.name}?include_deployment_progress=True&limit=20&filter.state=creating&sort=created_at.desc`
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a],
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
