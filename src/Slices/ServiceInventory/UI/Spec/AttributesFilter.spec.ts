import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either } from "@/Core";
import { Service, ServiceInstance, Pagination } from "@/Test";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN The Service Inventory WHEN the user filters on AttributeSet ('Active', 'Not Empty') THEN only instances which have active attributes are shown", async () => {
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

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "AttributeSet" }));
  userEvent.click(screen.getByRole("button", { name: "Select AttributeSet" }));
  userEvent.click(screen.getByRole("option", { name: "Active" }));
  userEvent.click(screen.getByRole("button", { name: "Select Quality" }));
  userEvent.click(screen.getByRole("option", { name: "Not Empty" }));

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/lsm/v1/service_inventory/${Service.a.name}?include_deployment_progress=True&limit=20&filter.attribute_set_not_empty=active_attributes&sort=created_at.desc`
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

  const summary = within(rowsAfter[0]).getByRole("list", {
    name: "AttributesSummary",
  });

  expect(
    within(summary).getByRole("listitem", {
      name: "Active-NotEmpty",
    })
  ).toBeInTheDocument();
});
