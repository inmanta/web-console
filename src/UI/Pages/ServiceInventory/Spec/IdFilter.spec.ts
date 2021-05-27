import { render, screen, act, within } from "@testing-library/react";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { Either } from "@/Core";
import userEvent, { specialChars } from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on id ('a') THEN only 1 instance is shown", async () => {
  const { component, serviceInstancesFetcher } =
    new ServiceInventoryPrepper().prep();

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

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });

  const picker = within(filterBar).getByRole("button", { name: "State" });
  userEvent.click(picker);

  const id = screen.getByRole("option", { name: "Id" });
  userEvent.click(id);

  const input = screen.getByRole("searchbox", { name: "IdFilter" });
  userEvent.type(input, `${ServiceInstance.A.id}${specialChars.enter}`);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.a.name}?include_deployment_progress=True&limit=20&filter.id=${ServiceInstance.A.id}&sort=created_at.desc`
  );

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
