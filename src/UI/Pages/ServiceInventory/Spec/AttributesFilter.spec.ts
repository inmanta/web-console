import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { Either } from "@/Core";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on AttributeSet ('Active', 'Not Empty') THEN only instances which have active attributes are shown", async () => {
  const {
    component,
    serviceInstancesFetcher,
  } = new ServiceInventoryPrepper().build();

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

  userEvent.click(
    within(
      screen.getByRole("generic", { name: "FilterBar" })
    ).getByRole("button", { name: "State" })
  );
  userEvent.click(screen.getByRole("option", { name: "AttributeSet" }));
  userEvent.click(
    screen.getByRole("button", { name: "Select an AttributeSet..." })
  );
  userEvent.click(screen.getByRole("option", { name: "Active" }));
  userEvent.click(screen.getByRole("button", { name: "Select a quality..." }));
  userEvent.click(screen.getByRole("option", { name: "Not Empty" }));

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.A.name}?include_deployment_progress=True&limit=20&filter.attribute_set_not_empty=active_attributes&sort=created_at.desc`
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

  const summary = within(rowsAfter[0]).getByRole("list", {
    name: "AttributesSummary",
  });

  expect(
    within(summary).queryByRole("listitem", {
      name: "Active-NotEmpty",
    })
  ).toBeInTheDocument();
});
