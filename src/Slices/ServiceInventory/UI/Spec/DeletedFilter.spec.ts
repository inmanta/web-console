import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either } from "@/Core";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on deleted ('Only') THEN only deleted instances are shown", async () => {
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
  await act(async () => {
    await userEvent.click(picker);
  });
  const id = screen.getByRole("option", { name: "Deleted" });
  await act(async () => {
    await userEvent.click(id);
  });
  const rule = within(filterBar).getByRole("button", {
    name: "Select Deleted",
  });
  await act(async () => {
    await userEvent.click(rule);
  });
  const only = screen.getByRole("option", { name: "Only" });
  await act(async () => {
    await userEvent.click(only);
  });
  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/lsm/v1/service_inventory/${Service.a.name}?include_deployment_progress=True&limit=20&filter.deleted=true&sort=created_at.desc`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, state: "terminated", deleted: true }],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);

  expect(within(rowsAfter[0]).getByText("terminated")).toBeInTheDocument();
});
