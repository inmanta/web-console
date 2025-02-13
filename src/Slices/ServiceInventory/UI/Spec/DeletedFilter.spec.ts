import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";
import { filterServer } from "./serverSetup";

test("GIVEN The Service Inventory WHEN the user filters on deleted ('Only') THEN only deleted instances are shown", async () => {
  filterServer.listen();
  const { component } = new ServiceInventoryPrepper().prep();

  render(component);

  const initialRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });

  expect(initialRows.length).toEqual(2);

  const filterBar = screen.getByRole("toolbar", { name: "FilterBar" });

  const picker = within(filterBar).getByRole("button", {
    name: "FilterPicker",
  });

  await userEvent.click(picker);

  const id = screen.getByRole("option", { name: "Deleted" });

  await userEvent.click(id);

  const rule = within(filterBar).getByRole("button", {
    name: "Select Deleted",
  });

  await userEvent.click(rule);

  const only = screen.getByRole("option", { name: "Only" });

  await userEvent.click(only);

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });

  expect(rowsAfter.length).toEqual(1);

  expect(within(rowsAfter[0]).getByText("terminated")).toBeInTheDocument();

  filterServer.close();
});
