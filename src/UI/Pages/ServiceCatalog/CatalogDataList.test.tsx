import { CatalogDataList } from "./CatalogDataList";
import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const singleService = [
  {
    attributes: [],
    description: "Description of service1",
    environment: "env",
    lifecycle: { initialState: "", states: [], transfers: [] },
    name: "service1",
    config: {},
  },
];
const doubleService = [
  ...singleService,
  {
    attributes: [],
    environment: "env",
    lifecycle: { initialState: "", states: [], transfers: [] },
    name: "otherService",
    config: {},
  },
];
const serviceCatalogUrl = "/lsm/v1/service_catalog";
const environmentId = "env";

test("GIVEN CatalogDataList WHEN no services ('undefined') THEN no services are shown", () => {
  render(
    <CatalogDataList
      services={undefined}
      environmentId={environmentId}
      serviceCatalogUrl={serviceCatalogUrl}
    />
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(within(list).queryByRole("listitem")).not.toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN no services ('[]') THEN no services are shown", () => {
  render(
    <CatalogDataList
      services={[]}
      environmentId={environmentId}
      serviceCatalogUrl={serviceCatalogUrl}
    />
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(within(list).queryByRole("listitem")).not.toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN 1 service THEN 1 service is shown", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={singleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(
    within(list).getByRole("listitem", { name: "service1" })
  ).toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN 2 services THEN 2 services are shown", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={doubleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(
    within(list).getByRole("listitem", { name: "service1" })
  ).toBeInTheDocument();
  expect(
    within(list).getByRole("listitem", { name: "otherService" })
  ).toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN service THEN service has correct link", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={singleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: "service1" });
  expect(listItem).toBeInTheDocument();
  const link = within(listItem).getByRole("link", { name: "Inventory" });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("href", "/lsm/catalog/service1/inventory");
});

test("GIVEN CatalogDataList WHEN description available THEN should show description", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={singleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: "service1" });
  const description = within(listItem).queryByText("Description of service1");
  expect(description).toBeVisible();
});

test("GIVEN CatalogDataList WHEN user clicks toggle THEN details are shown", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={singleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: "service1" });
  const button = within(listItem).getByRole("button", {
    name: "service1 Details",
  });
  userEvent.click(button);

  const details = within(listItem).queryByRole("region", {
    name: "Primary Content Details",
  });
  expect(details).toBeVisible();
});

test("GIVEN CatalogDataList WHEN user clicks toggle 2 times THEN details are hidden", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={singleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: "service1" });
  const button = within(listItem).getByRole("button", {
    name: "service1 Details",
  });
  userEvent.click(button);
  userEvent.click(button);

  const details = within(listItem).queryByRole("region", {
    name: "Primary Content Details",
  });
  expect(details).not.toBeInTheDocument();
});

test("GIVEN CatalogDataList with 2 services WHEN user clicks on both toggles THEN both details are shown", () => {
  render(
    <MemoryRouter>
      <CatalogDataList
        services={doubleService}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
      />
    </MemoryRouter>
  );

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem1 = within(list).getByRole("listitem", { name: "service1" });
  const listItem2 = within(list).getByRole("listitem", {
    name: "otherService",
  });

  expect(
    screen.queryByRole("region", {
      name: "Primary Content Details",
    })
  ).not.toBeInTheDocument();

  const toggle1 = within(listItem1).getByRole("button", {
    name: "service1 Details",
  });
  const toggle2 = within(listItem2).getByRole("button", {
    name: "otherService Details",
  });

  userEvent.click(toggle1);
  userEvent.click(toggle2);

  const details1 = within(listItem1).queryByRole("region", {
    name: "Primary Content Details",
  });
  const details2 = within(listItem2).queryByRole("region", {
    name: "Primary Content Details",
  });
  expect(details1).toBeVisible();
  expect(details2).toBeVisible();
});
