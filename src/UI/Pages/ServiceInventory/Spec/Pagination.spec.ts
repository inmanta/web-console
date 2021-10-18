import { render, screen, act } from "@testing-library/react";
import { ServiceInstance } from "@/Test";
import { Either } from "@/Core";
import userEvent from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

test("GIVEN ServiceInventory WHEN on 2nd page with outdated 1st page and user clicks on prev THEN first page is shown", async () => {
  const { component, serviceInstancesFetcher } =
    new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: {
          first: "first",
          prev: "prev",
          self: "self",
          next: "next",
          last: "last",
        },
        metadata: {
          total: 67,
          before: 22,
          after: 25,
          page_size: 20,
        },
      })
    );
  });

  const button = screen.getByRole("button", { name: "Prev" });
  userEvent.click(button);
  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual("first");
});
