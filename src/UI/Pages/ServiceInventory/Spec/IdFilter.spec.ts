import { render, screen, act, within } from "@testing-library/react";
import userEvent, { specialChars } from "@testing-library/user-event";
import { Either } from "@/Core";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on id ('a') THEN only 1 instance is shown", async () => {
  const { component, apiHelper } = new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });

  const picker = within(filterBar).getByRole("button", {
    name: "FilterPicker",
  });
  userEvent.click(picker);

  const id = screen.getByRole("option", { name: "Id" });
  userEvent.click(id);

  const input = screen.getByRole("searchbox", { name: "IdFilter" });
  userEvent.type(input, `${ServiceInstance.a.id}${specialChars.enter}`);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/lsm/v1/service_inventory/${Service.a.name}?include_deployment_progress=True&limit=20&filter.id=${ServiceInstance.a.id}&sort=created_at.desc`
  );

  await act(async () => {
    await apiHelper.resolve(
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
