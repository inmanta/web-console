import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { Row, Service, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";

import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { InventoryTable } from "./InventoryTable";
import { InventoryTablePresenter } from "./Presenters";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";

const dummySetter = () => {
  return;
};

const tablePresenterWithIdentity = () => new InventoryTablePresenter("service_id", "Service ID");

function setup(expertMode = false, setSortFn: (props) => void = dummySetter) {
  jest.spyOn(envModifier, "useEnvironmentModifierImpl").mockReturnValue({
    ...jest.requireActual("@/UI/Dependency/EnvironmentModifier"),
    useIsExpertModeEnabled: () => expertMode,
    useIsHalted: () => false,
  });

  const store = getStoreInstance();
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <ModalProvider>
              <InventoryTable
                rows={[Row.a]}
                tablePresenter={tablePresenterWithIdentity()}
                service={Service.withIdentity}
                setSort={setSortFn}
                sort={{ name: "created_at", order: "desc" }}
              />
            </ModalProvider>
          </StoreProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return component;
}

test("ServiceInventory shows service identity if it's defined", async () => {
  const component = setup();

  render(component);

  expect(await screen.findByText("Service ID")).toBeVisible();

  expect(await screen.findByText("instance1")).toBeVisible();
});

test("ServiceInventory shows sorting buttons for sortable columns", async () => {
  const component = setup();

  render(component);
  expect(await screen.findByRole("button", { name: /state/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /created/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /updated/i })).toBeVisible();
  expect(screen.queryByRole("button", { name: /attributes/i })).not.toBeInTheDocument();
});

test("ServiceInventory sets sorting parameters correctly on click", async () => {
  let sort;
  const expertMode = false;
  const component = setup(expertMode, (value) => (sort = value));

  render(component);
  const stateButton = await screen.findByRole("button", { name: /state/i });

  expect(stateButton).toBeVisible();

  await userEvent.click(stateButton);

  expect(sort.name).toEqual("state");
  expect(sort.order).toEqual("asc");
});

describe("Actions", () => {
  it("Should have 6 options in total", async () => {
    const component = setup();

    render(component);

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });

    await userEvent.click(menuToggle);

    const options = await screen.findAllByRole("menuitem");

    expect(options).toHaveLength(6);
  });
});
