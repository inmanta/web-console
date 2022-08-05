import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServiceModel } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  DeleteServiceCommandManager,
} from "@/Data";
import { dependencies, DynamicCommandManagerResolver, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { CatalogDataList } from "./CatalogDataList";

const Component = (services: ServiceModel[]) => {
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteServiceCommandManager(new BaseApiHelper()),
    ])
  );
  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
        <CatalogDataList services={services} />
      </DependencyProvider>
    </MemoryRouter>
  );
};

test("GIVEN CatalogDataList WHEN no services ('[]') THEN no services are shown", () => {
  render(Component([]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(within(list).queryByRole("listitem")).not.toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN 1 service THEN 1 service is shown", () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(
    within(list).getByRole("listitem", { name: Service.a.name })
  ).toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN 2 services THEN 2 services are shown", () => {
  render(Component([Service.a, Service.b]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(
    within(list).getByRole("listitem", { name: Service.a.name })
  ).toBeInTheDocument();
  expect(
    within(list).getByRole("listitem", { name: Service.b.name })
  ).toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN service THEN service has correct link", () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });
  expect(listItem).toBeInTheDocument();
  const link = within(listItem).getByRole("link", { name: "Inventory" });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute(
    "href",
    `/lsm/catalog/${Service.a.name}/inventory`
  );
});

test("GIVEN CatalogDataList WHEN description available THEN should show description", () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });
  const description = within(listItem).queryByText(
    Service.a.description as string
  );
  expect(description).toBeVisible();
});

test("GIVEN CatalogDataList WHEN user clicks toggle THEN details are shown", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });
  const button = within(listItem).getByRole("button", {
    name: `${Service.a.name} Details`,
  });
  await userEvent.click(button);

  const details = within(listItem).queryByRole("region", {
    name: "Primary Content Details",
  });
  expect(details).toBeVisible();
});

test("GIVEN CatalogDataList WHEN user clicks toggle 2 times THEN details are hidden", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });
  const button = within(listItem).getByRole("button", {
    name: `${Service.a.name} Details`,
  });
  await userEvent.click(button);
  await userEvent.click(button);

  const details = within(listItem).queryByRole("region", {
    name: "Primary Content Details",
  });
  expect(details).not.toBeInTheDocument();
});

test("GIVEN CatalogDataList with 2 services WHEN user clicks on both toggles THEN both details are shown", async () => {
  render(Component([Service.a, Service.b]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem1 = within(list).getByRole("listitem", {
    name: Service.a.name,
  });
  const listItem2 = within(list).getByRole("listitem", {
    name: Service.b.name,
  });

  expect(
    screen.queryByRole("region", {
      name: "Primary Content Details",
    })
  ).not.toBeInTheDocument();

  const toggle1 = within(listItem1).getByRole("button", {
    name: `${Service.a.name} Details`,
  });
  const toggle2 = within(listItem2).getByRole("button", {
    name: `${Service.b.name} Details`,
  });

  await userEvent.click(toggle1);
  await userEvent.click(toggle2);

  const details1 = within(listItem1).queryByRole("region", {
    name: "Primary Content Details",
  });
  const details2 = within(listItem2).queryByRole("region", {
    name: "Primary Content Details",
  });
  expect(details1).toBeVisible();
  expect(details2).toBeVisible();
});
