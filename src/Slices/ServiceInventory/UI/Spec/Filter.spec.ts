import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@/UI";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";
import { filterServer } from "./serverSetup";

test("GIVEN The Service Inventory WHEN the user filters on something THEN a data update is triggered", async () => {
  const { component } = new ServiceInventoryPrepper().prep();

  filterServer.listen();
  render(component);

  const beforeRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });

  expect(beforeRows.length).toEqual(2);

  await userEvent.click(screen.getByLabelText("FilterPicker"));
  await userEvent.click(screen.getByRole("option", { name: "State" }));

  const input = await screen.findByPlaceholderText(
    words("inventory.filters.state.placeholder"),
  );

  await userEvent.click(input);

  const option = await screen.findByRole("option", {
    name: `${words("inventory.test.creating")}`,
  });

  await userEvent.click(option);

  const afterRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });

  expect(afterRows.length).toEqual(1);

  filterServer.close();
});
