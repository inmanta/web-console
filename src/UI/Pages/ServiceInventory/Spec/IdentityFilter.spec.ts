import { render, screen, act, within } from "@testing-library/react";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { Either } from "@/Core";
import userEvent, { specialChars } from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on identity ('Order ID', '0001') THEN only 1 instance is shown", async () => {
  const { component, serviceInstancesFetcher } =
    new ServiceInventoryPrepper().prep(Service.withIdentity);

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [
          { ...ServiceInstance.A, service_identity_attribute_value: "0001" },
          { ...ServiceInstance.B, service_identity_attribute_value: "0002" },
        ],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });
  userEvent.click(within(filterBar).getByRole("button", { name: "State" }));
  userEvent.click(screen.getByRole("option", { name: "Order ID" }));

  const input = screen.getByRole("searchbox", { name: "IdentityFilter" });
  userEvent.type(input, `0001${specialChars.enter}`);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.withIdentity.name}?include_deployment_progress=True&limit=20&filter.order_id=0001&sort=created_at.desc`
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [
          { ...ServiceInstance.A, service_identity_attribute_value: "0001" },
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
