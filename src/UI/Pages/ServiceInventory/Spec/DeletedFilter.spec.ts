import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { Either } from "@/Core";
import { ServiceInventoryBuilder } from "./ServiceInventoryBuilder";

test("GIVEN The Service Inventory WHEN the user filters on deleted ('Only') THEN only deleted instances are shown", async () => {
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

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });

  const picker = within(filterBar).getByRole("button", { name: "State" });
  userEvent.click(picker);

  const id = screen.getByRole("option", { name: "Deleted" });
  userEvent.click(id);

  const rule = within(filterBar).getByRole("button", {
    name: "Select a rule...",
  });
  userEvent.click(rule);

  const only = screen.getByRole("option", { name: "Only" });
  userEvent.click(only);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.A.name}?include_deployment_progress=True&limit=20&filter.deleted=true&sort=created_at.desc`
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.deleted],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);

  expect(
    within(rowsAfter[0]).queryByRole("generic", {
      name: "InstanceState-terminated",
    })
  ).toBeInTheDocument();
});
