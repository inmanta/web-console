import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either } from "@/Core";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on identity ('Order ID', '0001') THEN only 1 instance is shown", async () => {
  const { component, apiHelper } = ServiceInventoryPrepper(
    Service.withIdentity
  );

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [
          { ...ServiceInstance.a, service_identity_attribute_value: "0001" },
          { ...ServiceInstance.b, service_identity_attribute_value: "0002" },
        ],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });
  await act(async () => {
    await userEvent.click(
      within(filterBar).getByRole("button", { name: "FilterPicker" })
    );
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("option", { name: "Order ID" }));
  });

  const input = screen.getByRole("searchbox", { name: "IdentityFilter" });
  await act(async () => {
    await userEvent.type(input, `0001{enter}`);
  });

  expect(apiHelper.pendingRequests[1].url).toEqual(
    `/lsm/v1/service_inventory/${Service.withIdentity.name}?include_deployment_progress=True&limit=20&filter.order_id=0001&sort=created_at.desc`
  );

  await act(async () => {
    await apiHelper.resolve(Either.right(""));
    await apiHelper.resolve(
      Either.right({
        data: [
          { ...ServiceInstance.a, service_identity_attribute_value: "0001" },
        ],
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
    within(rowsAfter[0]).getByRole("cell", { name: "IdentityCell-0001" })
  ).toBeInTheDocument();
});
