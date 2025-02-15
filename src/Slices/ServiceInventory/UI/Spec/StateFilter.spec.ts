import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";
import { filterServer } from "./serverSetup";

test("GIVEN The Service Inventory WHEN the user filters on state ('creating') THEN only that type of instance is fetched and shown", async () => {
  filterServer.listen();
  const { component } = new ServiceInventoryPrepper().prep();

  render(component);

  const initialRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });

  expect(initialRows.length).toEqual(2);

  await userEvent.click(screen.getByLabelText("FilterPicker"));
  await userEvent.click(screen.getByRole("option", { name: "State" }));

  const input = await screen.findByPlaceholderText("Select a state...");

  await userEvent.click(input);

  const option = await screen.findByRole("option", { name: "creating" });

  await userEvent.click(option);

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });

  expect(rowsAfter.length).toEqual(1);

  filterServer.close();
});
