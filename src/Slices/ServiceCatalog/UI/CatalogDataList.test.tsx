import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServiceModel } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  DeleteServiceCommandManager,
} from "@/Data";
import { dependencies, DynamicCommandManagerResolver, Service } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { CatalogDataList } from "./CatalogDataList";

const Component = (services: ServiceModel[]) => {
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      DeleteServiceCommandManager(new BaseApiHelper()),
    ]),
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
    within(list).getByRole("listitem", { name: Service.a.name }),
  ).toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN 2 services THEN 2 services are shown", () => {
  render(Component([Service.a, Service.b]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  expect(
    within(list).getByRole("listitem", { name: Service.a.name }),
  ).toBeInTheDocument();
  expect(
    within(list).getByRole("listitem", { name: Service.b.name }),
  ).toBeInTheDocument();
});

test("GIVEN CatalogDataList WHEN service THEN service inventory has correct link", () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });
  expect(listItem).toBeInTheDocument();
  const link = within(listItem).getByRole("link", {
    name: words("catalog.button.inventory"),
  });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute(
    "href",
    `/lsm/catalog/${Service.a.name}/inventory`,
  );
});

test("GIVEN CatalogDataList WHEN service THEN service details has correct link", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });

  expect(listItem).toBeInTheDocument();

  const dropdown = within(listItem).getByLabelText("Actions-details");
  await act(async () => {
    await userEvent.click(within(dropdown).getByRole("button"));
  });

  const link = screen.getByRole("link", {
    name: words("catalog.button.details"),
  });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute(
    "href",
    `/lsm/catalog/${Service.a.name}/details`,
  );
});

test("GIVEN CatalogDataList WHEN description available THEN should show description", () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByRole("listitem", { name: Service.a.name });
  const description = within(listItem).queryByText(
    Service.a.description as string,
  );
  expect(description).toBeVisible();
});
