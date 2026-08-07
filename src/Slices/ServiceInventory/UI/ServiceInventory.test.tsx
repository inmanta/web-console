import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { Service, ServiceInstance, Pagination, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Chart } from "./Components";
import { ServiceInventory } from "./ServiceInventory";

function setup(service = Service.a, pageSize = "") {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={[`/?env=aaa${pageSize}`]}>
        <MockedDependencyProvider>
          <ModalProvider>
            <Page>
              <ServiceInventory
                serviceName={service.name}
                service={service}
                intro={<Chart summary={service.instance_summary} />}
              />
            </Page>
          </ModalProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("ServiceInventory", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  // The unfiltered response used as the "before" state of the filter tests: two instances.
  const twoInstancesResponse = () => ({
    data: [
      { ...ServiceInstance.a, id: "a" },
      { ...ServiceInstance.b, id: "b" },
    ],
    links: Pagination.links,
    metadata: Pagination.metadata,
  });

  const openFilterDrawer = () =>
    userEvent.click(screen.getByRole("button", { name: /Filters/, pressed: false }));

  test("ServiceInventory shows empty view instances", async () => {
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

  test("ServiceInventory shows error with retry", async () => {
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

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ServiceInventory shows next page of instances", async () => {
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

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ServiceInventory shows instance summary chart", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_e", () => {
        return HttpResponse.json({
          data: [
            {
              ...ServiceInstance.allAttrs,
              id: "a",
              service_identity_attribute_value: undefined,
            },
          ],
          links: Pagination.links,
          metadata: Pagination.metadata,
        });
      })
    );

    const { component } = setup(Service.withInstanceSummary);

    render(component);

    expect(
      await screen.findByRole("img", { name: words("catalog.summary.title") })
    ).toBeInTheDocument();
  });

  test("ServiceInventory shows enabled composer buttons for root instances ", async () => {
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

  test("ServiceInventory shows only button to display instance in the composer for non-root", async () => {
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

  test("GIVEN ServiceInventory WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
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

  test("GIVEN ServiceInventory WHEN the user filters on state 'creating' THEN only matching instances are shown", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get("filter.state") === "creating") {
          return HttpResponse.json({
            ...twoInstancesResponse(),
            data: [{ ...ServiceInstance.a, id: "a" }],
          });
        }

        return HttpResponse.json(twoInstancesResponse());
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(2);

    await openFilterDrawer();

    const stateInput = await screen.findByPlaceholderText(
      words("inventory.filters.state.placeholder")
    );

    await userEvent.click(stateInput);

    await userEvent.click(
      await screen.findByRole("option", { name: words("inventory.test.creating") })
    );

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(1);
  });

  test("GIVEN ServiceInventory WHEN the user filters on id THEN only the matching instance is shown", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get("filter.id_or_service_identity") === ServiceInstance.c.id) {
          return HttpResponse.json({
            ...twoInstancesResponse(),
            data: [ServiceInstance.c],
          });
        }

        return HttpResponse.json(twoInstancesResponse());
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(2);

    await openFilterDrawer();

    const idInput = await screen.findByRole("searchbox", {
      name: words("inventory.filters.id.label"),
    });

    await userEvent.type(idInput, `${ServiceInstance.c.id}{enter}`);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(1);
  });

  test("GIVEN ServiceInventory WHEN the user filters on deleted 'Only' THEN only deleted instances are shown", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get("filter.deleted") === "true") {
          return HttpResponse.json({
            ...twoInstancesResponse(),
            data: [{ ...ServiceInstance.d, id: "d", state: "terminated", deleted: true }],
          });
        }

        return HttpResponse.json(twoInstancesResponse());
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(2);

    await openFilterDrawer();

    const deletedInput = await screen.findByRole("combobox", { name: "DeletedFilterInput" });

    await userEvent.click(deletedInput);

    await userEvent.click(await screen.findByRole("option", { name: "Only" }));

    const rows = await screen.findAllByRole("row", { name: "InstanceRow-Intro" });

    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByText("terminated")).toBeInTheDocument();
  });

  test("GIVEN ServiceInventory WHEN the user includes a non-empty attribute set THEN only matching instances are shown", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get("filter.attribute_set_not_empty") === "active_attributes") {
          return HttpResponse.json({
            ...twoInstancesResponse(),
            data: [{ ...ServiceInstance.a, id: "a" }],
          });
        }

        return HttpResponse.json(twoInstancesResponse());
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(2);

    await openFilterDrawer();

    await userEvent.click(screen.getByRole("button", { name: "Attribute set-toggle" }));

    await userEvent.click(await screen.findByRole("button", { name: "Active-include-toggle" }));

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(1);
  });

  test("GIVEN ServiceInventory WHEN on the 2nd page with an outdated 1st page AND the user clicks prev THEN the first page is shown", async () => {
    const instances = [
      { ...ServiceInstance.a, id: "a" },
      { ...ServiceInstance.b, id: "b" },
      { ...ServiceInstance.c, id: "c" },
      { ...ServiceInstance.d, id: "d" },
    ];
    const defaultPage = {
      data: instances,
      links: { self: "self", next: "fake-link?end=fake-param", last: "last" },
      metadata: { total: 67, before: 0, after: 47, page_size: 20 },
    };
    const firstPage = {
      ...defaultPage,
      data: instances.slice(0, 2),
    };
    const secondPage = {
      data: instances.slice(3),
      links: {
        first: "first",
        prev: "/lsm/v1/service_inventory/service_name_a?start=fake-param",
        self: "self",
        next: "fake-link?end=fake-param",
        last: "last",
      },
      // before (22) < page_size * 2 (40), so the prev handler resolves to the first page
      // (no start/end param), which returns the full, up-to-date default page.
      metadata: { total: 67, before: 22, after: 25, page_size: 20 },
    };

    server.use(
      http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get("start") === "fake-param") {
          return HttpResponse.json(firstPage);
        }

        if (url.searchParams.get("end") === "fake-param") {
          return HttpResponse.json(secondPage);
        }

        return HttpResponse.json(defaultPage);
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(4);

    const nextButton = screen.getByRole("button", { name: "Go to next page" });

    expect(nextButton).toBeEnabled();
    await userEvent.click(nextButton);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(1);

    const prevButton = screen.getByRole("button", { name: "Go to previous page" });

    expect(prevButton).toBeEnabled();
    await userEvent.click(prevButton);

    expect(await screen.findAllByRole("row", { name: "InstanceRow-Intro" })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
  });
});
