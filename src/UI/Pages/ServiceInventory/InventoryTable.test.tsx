import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import {
  QueryResolverImpl,
  getStoreInstance,
  QueryManagerResolver,
} from "@/Data";
import {
  Row,
  tablePresenter,
  tablePresenterWithIdentity,
  StaticScheduler,
  InstantApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { InventoryTable } from "./InventoryTable";

const dummySetter = () => {
  return;
};

test("InventoryTable can be expanded", async () => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(
      store,
      new InstantApiHelper({
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
      new StaticScheduler(),
      new StaticScheduler()
    )
  );
  render(
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <InventoryTable
            rows={[Row.a, Row.b]}
            tablePresenter={tablePresenter}
            setSort={dummySetter}
            sort={{ name: "created_at", order: "desc" }}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
  const testid = `details_${Row.a.id.short}`;

  // Act
  const expandCell = screen.getByLabelText(`expand-button-${Row.a.id.short}`);

  fireEvent.click(within(expandCell).getByRole("button"));

  // Assert
  expect(await screen.findByTestId(testid)).toBeVisible();
});

test("ServiceInventory can show resources for instance", async () => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(
      store,
      new InstantApiHelper({
        kind: "Success",
        data: {
          data: [
            {
              resource_id: "resource_id_1,v=1",
              resource_state: "resource_state",
            },
          ],
        },
      }),
      new StaticScheduler(),
      new StaticScheduler()
    )
  );

  render(
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <InventoryTable
            rows={[Row.a, Row.b]}
            tablePresenter={tablePresenter}
            setSort={dummySetter}
            sort={{ name: "created_at", order: "desc" }}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  const expandCell = screen.getByLabelText(`expand-button-${Row.a.id.short}`);

  fireEvent.click(within(expandCell).getByRole("button"));

  fireEvent.click(screen.getByRole("button", { name: "Resources" }));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
  ).toBeInTheDocument();

  expect(screen.getByText("resource_id_1")).toBeInTheDocument();
});

test("ServiceInventory shows service identity if it's defined", async () => {
  render(
    <MemoryRouter>
      <InventoryTable
        rows={[Row.a]}
        tablePresenter={tablePresenterWithIdentity}
        setSort={dummySetter}
        sort={{ name: "created_at", order: "desc" }}
      />
    </MemoryRouter>
  );

  expect(await screen.findByText("Order ID")).toBeVisible();

  expect(await screen.findByText("instance1")).toBeVisible();
});

test("ServiceInventory shows sorting buttons for sortable columns", async () => {
  render(
    <MemoryRouter>
      <InventoryTable
        rows={[Row.a]}
        tablePresenter={tablePresenter}
        setSort={dummySetter}
        sort={{ name: "created_at", order: "desc" }}
      />
    </MemoryRouter>
  );
  expect(await screen.findByRole("button", { name: /state/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /created/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /updated/i })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /attributes/i })
  ).not.toBeInTheDocument();
});

test("ServiceInventory sets sorting parameters correctly on click", async () => {
  let sort;
  render(
    <MemoryRouter>
      <InventoryTable
        rows={[Row.a]}
        tablePresenter={tablePresenter}
        setSort={(v) => (sort = v)}
        sort={{ name: "created_at", order: "desc" }}
      />
    </MemoryRouter>
  );
  const stateButton = await screen.findByRole("button", { name: /state/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(sort.name).toEqual("state");
  expect(sort.order).toEqual("asc");
});
