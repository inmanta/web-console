import React, { act } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { getStoreInstance } from "@/Data";
import { dependencies, MockEnvironmentModifier } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { CatalogActions } from "./CatalogActions";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const server = setupServer();

function setup(
  details = {
    halted: false,
    server_compile: true,
    protected_environment: false,
    enable_lsm_expert_mode: false,
  },
) {
  const client = new QueryClient();
  const store = getStoreInstance();
  const environmentModifier = new MockEnvironmentModifier(details);

  const component = (
    <QueryClientProvider client={client}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier,
          }}
        >
          <ModalProvider>
            <CatalogActions />
          </ModalProvider>
        </DependencyProvider>
      </StoreProvider>
    </QueryClientProvider>
  );

  return { component };
}

beforeAll(() => server.listen());

beforeEach(() => {
  server.resetHandlers();
});
afterEach(cleanup);

afterAll(() => {
  server.close();
});

test("Given CatalogUpdateButton, when user clicks on button, it should display a modal.", async () => {
  const { component } = setup();

  render(component);

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

  expect(button).toBeVisible();

  await userEvent.click(button);

  expect(
    await screen.findByText(words("catalog.update.modal.title")),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given CatalogUpdateButton, when user cancels the modal, it should not fire the API call and close the modal.", async () => {
  server.use(
    http.post("/lsm/v1/exporter/export_service_definition", () => {
      return HttpResponse.json({ status: 200 });
    }),
  );

  const { component } = setup();

  render(component);

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

  await userEvent.click(button);

  const cancelButton = await screen.findByText(words("no"));

  expect(cancelButton).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(cancelButton);

  expect(await screen.queryByText(words("catalog.update.success"))).toBeNull();
});

test("Given CatalogUpdateButton, when user confirms update, it should fire the API call, if success, show a toaster on success and close the modal.", async () => {
  const { component } = setup();
  server.use(
    http.post("/lsm/v1/exporter/export_service_definition", () => {
      return HttpResponse.json({ status: 200 });
    }),
  );

  render(component);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

  await userEvent.click(button);

  const confirmButton = await screen.findByText(words("yes"));

  expect(confirmButton).toBeVisible();

  await userEvent.click(confirmButton);

  expect(confirmButton).not.toBeVisible();

  expect(
    await screen.queryByText(words("catalog.update.success")),
  ).toBeVisible();
});

test("Given CatalogUpdateButton, when user confirms the update, it should fire the API call, if failure, it should show an error toast and close the modal.", async () => {
  server.use(
    http.post("/lsm/v1/exporter/export_service_definition", () => {
      return HttpResponse.json(
        { message: "Something went wrong" },
        { status: 400 },
      );
    }),
  );
  const { component } = setup();

  render(component);

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

  await userEvent.click(button);

  const confirmButton = await screen.findByText(words("yes"));

  expect(confirmButton).toBeVisible();

  await userEvent.click(confirmButton);

  expect(await screen.findByText("Something went wrong")).toBeVisible();
});

test("Given API documentation button, it has the right href link.", async () => {
  const { component } = setup();

  render(component);

  const button = screen.getByRole("link", {
    name: "API-Documentation",
  });

  expect(button).toHaveAttribute(
    "href",
    "/lsm/v1/service_catalog_docs?environment=env",
  );
});
