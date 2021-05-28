import { Service } from "@/Test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { CatalogDrawer } from "./CatalogDrawer";

it("Drawer Panel is shown when an item is selected and closed on click", async () => {
  render(
    <MemoryRouter>
      <CatalogDrawer
        environmentId={Service.c.environment}
        serviceCatalogUrl="/"
        services={[Service.c]}
      />
    </MemoryRouter>
  );
  userEvent.click(await screen.findByText(Service.c.name));
  expect(await screen.findByLabelText("InstanceSummaryPanel")).toBeVisible();
  userEvent.click(await screen.findByLabelText("CloseSummaryButton"));
  expect(
    await screen.findByLabelText("InstanceSummaryPanel")
  ).not.toBeVisible();
});
