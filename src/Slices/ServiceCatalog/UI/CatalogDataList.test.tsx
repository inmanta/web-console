import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { ServiceModel } from "@/Core";
import { MockedDependencyProvider, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CatalogDataList } from "./CatalogDataList";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const Component = (services: ServiceModel[]) => {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <CatalogDataList services={services} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
};

test("GIVEN CatalogDataList WHEN no services ('[]') THEN no services are shown", async () => {
  render(Component([]));

  const list = screen.getByRole("list", { name: "List of service entities" });

  expect(within(list).queryByTestId(Service.a.name + "-item")).not.toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogDataList WHEN 1 service THEN 1 service is shown", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });

  expect(within(list).getByTestId(Service.a.name + "-item")).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogDataList WHEN 2 services THEN 2 services are shown", async () => {
  render(Component([Service.a, Service.b]));

  const list = screen.getByRole("list", { name: "List of service entities" });

  expect(within(list).getByTestId(Service.a.name + "-item")).toBeInTheDocument();
  expect(within(list).getByTestId(Service.b.name + "-item")).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogDataList WHEN service THEN service inventory has correct link", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByTestId(Service.a.name + "-item");

  expect(listItem).toBeInTheDocument();
  const link = within(listItem).getByRole("link", {
    name: words("catalog.button.inventory"),
  });

  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("href", `/lsm/catalog/${Service.a.name}/inventory`);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogDataList WHEN service THEN service details has correct link", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByTestId(Service.a.name + "-item");

  expect(listItem).toBeInTheDocument();

  const dropdown = screen.getByLabelText("Actions-dropdown");

  await userEvent.click(dropdown);

  const link = screen.getByRole("link", {
    name: words("catalog.button.details"),
  });

  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("href", `/lsm/catalog/${Service.a.name}/details`);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogDataList WHEN description available THEN should show description", async () => {
  render(Component([Service.a]));

  const list = screen.getByRole("list", { name: "List of service entities" });
  const listItem = within(list).getByTestId(Service.a.name + "-item");
  const description = within(listItem).queryByText(Service.a.description as string);

  expect(description).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
