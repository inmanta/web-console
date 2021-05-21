import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import {
  DummyStateHelper,
  InstantFetcher,
  rows,
  tablePresenter,
  tablePresenterWithIdentity,
  StaticScheduler,
  DynamicDataManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import { StoreProvider } from "easy-peasy";
import {
  DataProviderImpl,
  ResourcesDataManager,
  ResourcesStateHelper,
} from "@/UI/Data";
import userEvent from "@testing-library/user-event";
import { UrlManagerImpl } from "@/UI/Routing";

const dummySetter = () => {
  return;
};

test("InventoryTable can be expanded", async () => {
  // Arrange
  const dataProvider = new DataProviderImpl(
    new DynamicDataManagerResolver([
      new ResourcesDataManager(
        new InstantFetcher<"Resources">({
          kind: "Success",
          data: {
            data: [
              {
                resource_id: "resource_id_1",
                resource_state: "resource_state",
              },
            ],
          },
        }),
        new DummyStateHelper<"Resources">(),
        new StaticScheduler(),
        "env"
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", "env");
  render(
    <DependencyProvider dependencies={{ dataProvider, urlManager }}>
      <InventoryTable
        rows={rows}
        tablePresenter={tablePresenter}
        setSortColumn={dummySetter}
        setOrder={dummySetter}
      />
    </DependencyProvider>
  );
  const testid = `details_${rows[0].id.short}`;

  // Act
  const expandCell = screen.getByLabelText(`expand-button-${rows[0].id.short}`);

  fireEvent.click(within(expandCell).getByRole("button"));

  // Assert
  expect(await screen.findByTestId(testid)).toBeVisible();
});

test("ServiceInventory can show resources for instance", async () => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl(
    new DynamicDataManagerResolver([
      new ResourcesDataManager(
        new InstantFetcher<"Resources">({
          kind: "Success",
          data: {
            data: [
              {
                resource_id: "resource_id_1",
                resource_state: "resource_state",
              },
            ],
          },
        }),
        new ResourcesStateHelper(store),
        new StaticScheduler(),
        "env"
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", "env");
  render(
    <DependencyProvider dependencies={{ dataProvider, urlManager }}>
      <StoreProvider store={store}>
        <InventoryTable
          rows={rows}
          tablePresenter={tablePresenter}
          setSortColumn={dummySetter}
          setOrder={dummySetter}
        />
      </StoreProvider>
    </DependencyProvider>
  );

  const expandCell = screen.getByLabelText(`expand-button-${rows[0].id.short}`);

  fireEvent.click(within(expandCell).getByRole("button"));

  fireEvent.click(screen.getByRole("button", { name: "Resources" }));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
  ).toBeInTheDocument();

  expect(screen.getByText("resource_id_1")).toBeInTheDocument();
});

test("ServiceInventory shows service identity if it's defined", async () => {
  render(
    <InventoryTable
      rows={[rows[0]]}
      tablePresenter={tablePresenterWithIdentity}
      setSortColumn={dummySetter}
      setOrder={dummySetter}
    />
  );

  expect(await screen.findByText("Order ID")).toBeVisible();

  expect(await screen.findByText("instance1")).toBeVisible();
});

test("ServiceInventory shows sorting buttons for sortable columns", async () => {
  render(
    <InventoryTable
      rows={[rows[0]]}
      tablePresenter={tablePresenter}
      setSortColumn={dummySetter}
      setOrder={dummySetter}
    />
  );
  expect(await screen.findByRole("button", { name: /state/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /created/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /updated/i })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /attributes/i })
  ).not.toBeInTheDocument();
});

test("ServiceInventory sets sorting parameters correctly on click", async () => {
  let sortColumn;
  let order;
  render(
    <InventoryTable
      rows={[rows[0]]}
      tablePresenter={tablePresenter}
      setSortColumn={(name) => (sortColumn = name)}
      setOrder={(dir) => (order = dir)}
    />
  );
  const stateButton = await screen.findByRole("button", { name: /state/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(sortColumn).toEqual("state");
  expect(order).toEqual("asc");
});
