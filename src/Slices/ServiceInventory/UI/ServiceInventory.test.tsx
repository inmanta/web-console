import React, { act } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import {
  Service,
  ServiceInstance,
  Pagination,
  StaticScheduler,
  MockEnvironmentModifier,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { Chart } from "./Components";
import { ServiceInventory } from "./ServiceInventory";

expect.extend(toHaveNoViolations);

function setup(service = Service.a, pageSize = "") {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

  const environmentHandler = EnvironmentHandlerImpl(useLocation, dependencies.routeManager);

  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        halted: false,
        settings: {
          enable_lsm_expert_mode: false,
        },
      },
    ])
  );
  const component = (
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={[`/?env=aaa${pageSize}`]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier: new MockEnvironmentModifier(),
            environmentHandler,
          }}
        >
          <StoreProvider store={store}>
            <ModalProvider>
              <Page>
                <ServiceInventory
                  serviceName={service.name}
                  service={service}
                  intro={<Chart summary={service.instance_summary} />}
                />
              </Page>
            </ModalProvider>
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
    apiHelper,
    scheduler,
  };
}

describe("ServiceInventory", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("ServiceInventory shows empty view instances", async() => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", () => {
        return HttpResponse.json({ data: [], metadata: Pagination.metadata });
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "ServiceInventory-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", { name: "ServiceInventory-Empty" })
    ).toBeInTheDocument();
  });

  test("ServiceInventory shows error with retry", async() => {
    let queryCount = 0;

    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", () => {
        if (queryCount === 0) {
          queryCount++;

          return HttpResponse.json({ message: "something went wrong" }, { status: 500 });
        }

        return HttpResponse.json({
          data: [ServiceInstance.a],
          links: Pagination.links,
          metadata: Pagination.metadata,
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "ServiceInventory-Failed" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("grid", { name: "ServiceInventory-Success" })
    ).toBeInTheDocument();

    await act(async() => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ServiceInventory shows next page of instances", async() => {
    let queryCount = 0;

    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", () => {
        const response = {
          data: [
            {
              ...ServiceInstance.a,
              id: "a",
              service_identity_attribute_value: undefined,
            },
          ],
          links: Pagination.links,
          metadata: Pagination.metadata,
        };

        if (queryCount === 0) {
          queryCount++;

          return HttpResponse.json(response);
        }

        return HttpResponse.json({
          ...response,
          data: [
            {
              ...ServiceInstance.a,
              id: "b",
              service_identity_attribute_value: undefined,
            },
          ],
        });
      })
    );
    const { component } = setup(Service.a, "&state.Inventory.pageSize=10");

    render(component);

    expect(await screen.findByLabelText("IdCell-a")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(await screen.findByRole("cell", { name: "IdCell-b" })).toBeInTheDocument();

    await act(async() => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ServiceInventory shows instance summary chart", async() => {
    const { component } = setup(Service.withInstanceSummary);

    render(component);

    expect(
      await screen.findByRole("img", { name: words("catalog.summary.title") })
    ).toBeInTheDocument();
  });

  test("ServiceInventory shows enabled composer buttons for root instances ", async() => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", () => {
        return HttpResponse.json({
          data: [
            {
              ...ServiceInstance.a,
              id: "a",
            },
          ],
          links: Pagination.links,
          metadata: Pagination.metadata,
        });
      })
    );

    const { component } = setup(Service.a);

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "AddInstanceToggle" }));

    expect(await screen.findByText("Add in Composer")).toBeEnabled();

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });

    await userEvent.click(menuToggle);

    expect(await screen.findByText("Edit in Composer")).toBeEnabled();

    expect(screen.queryByText("Show in Composer")).toBeEnabled();
  });

  test("ServiceInventory shows only button to display instance in the composer for non-root", async() => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", () => {
        return HttpResponse.json({
          data: [
            {
              ...ServiceInstance.a,
              id: "a",
            },
          ],
          links: Pagination.links,
          metadata: Pagination.metadata,
        });
      })
    );
    const { component } = setup({ ...Service.a, owner: "owner" });

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "AddInstanceToggle" }));

    expect(screen.getByText("Add in Composer")).toBeInTheDocument();

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });

    await userEvent.click(menuToggle);

    expect(await screen.findByText("Show in Composer")).toBeEnabled();

    expect(screen.getByText("Edit in Composer")).toBeInTheDocument();
  });

  test("GIVEN ServiceInventory WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async() => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
        const url = new URL(request.url);
        const endParam = url.searchParams.get("end");

        if (endParam === "fake-param") {
          return HttpResponse.json({
            data: [{ ...ServiceInstance.a, id: "b" }],
            links: { ...Pagination.links },
            metadata: {
              total: 23,
              before: 20,
              after: 0,
              page_size: 20,
            },
          });
        }

        return HttpResponse.json({
          data: [
            {
              ...ServiceInstance.a,
              id: "a",
            },
          ],
          links: Pagination.links,
          metadata: {
            total: 23,
            before: 0,
            after: 3,
            page_size: 20,
          },
        });
      })
    );

    const { component } = setup({ ...Service.a, owner: "owner" });

    render(component);

    expect(await screen.findByLabelText("IdCell-a")).toBeInTheDocument();
    const nextPageButton = await screen.findByLabelText("Go to next page");

    expect(nextPageButton).toBeEnabled();

    await userEvent.click(nextPageButton);

    expect(await screen.findByLabelText("IdCell-b")).toBeInTheDocument();

    const refreshedNextButton = await screen.findByLabelText("Go to next page");

    expect(refreshedNextButton).toBeDisabled();

    //sort on the second page
    const columnheader = screen.getByRole("columnheader", {
      name: /state/i,
    });

    await userEvent.click(
      within(columnheader).getByRole("button", {
        name: /state/i,
      })
    );

    expect(await screen.findByLabelText("IdCell-a")).toBeInTheDocument();
    const refreshedNextButton2 = await screen.findByLabelText("Go to next page");

    expect(refreshedNextButton2).toBeEnabled();
  });
});
