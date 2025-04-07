import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";
import { paginationServer } from "./serverSetup";

test("GIVEN ServiceInventory WHEN on 2nd page with outdated 1st page and user clicks on prev THEN first page is shown", async() => {
  paginationServer.listen();
  const { component } = new ServiceInventoryPrepper().prep();

  render(component);

  const rowsOnPage = await screen.findAllByLabelText("InstanceRow-Intro");

  expect(rowsOnPage.length).toEqual(4);

  const nextButton = screen.getByRole("button", { name: "Go to next page" });

  expect(nextButton).toBeEnabled();
  await userEvent.click(nextButton);

  const refreshedRowsOnPage1 = await screen.findAllByLabelText("InstanceRow-Intro");

  expect(refreshedRowsOnPage1.length).toEqual(1);

  const prevButton = screen.getByRole("button", {
    name: "Go to previous page",
  });

  expect(prevButton).toBeEnabled();

  //server is set up in a way that if call through prev link was made, it would return different result - see PaginationServer and getPaginationHandlers for more info
  await userEvent.click(prevButton);

  const refreshedRowsOnPage2 = await screen.findAllByLabelText("InstanceRow-Intro");

  expect(refreshedRowsOnPage2.length).toEqual(4);

  const refreshed = screen.getByRole("button", { name: "Go to previous page" });

  expect(refreshed).toBeDisabled();

  paginationServer.close();
});
