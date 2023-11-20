import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Either } from "@/Core";
import { ServiceInstance } from "@/Test";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN ServiceInventory WHEN on 2nd page with outdated 1st page and user clicks on prev THEN first page is shown", async () => {
  const { component, apiHelper } = new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: {
          first: "first",
          prev: "/fake-link?end=fake-param",
          self: "self",
          next: "fake-link?start=fake-param",
          last: "last",
        },
        metadata: {
          total: 67,
          before: 22,
          after: 25,
          page_size: 20,
        },
      }),
    );
  });

  const button = screen.getByRole("button", { name: "Go to previous page" });

  expect(button).toBeEnabled();

  await act(async () => {
    await userEvent.click(button);
  });

  expect(apiHelper.pendingRequests).toEqual([]);
});
