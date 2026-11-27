import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { words } from "@inmanta/web-console-core";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { MockOrchestratorProvider } from "@inmanta/web-console-test-utils/Mock/MockOrchestratorProvider";
import { baseSetup } from "@inmanta/web-console-test-utils/Utils/base-setup";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { ComposerPage } from "./ComposerPage";
import {
  childService,
  inventoryInstance,
  parentService,
  serviceCatalog,
} from "./Mock/serviceModels";
import { defineReactFlowTestObjects } from "./testSetup";

defineReactFlowTestObjects();

const instance = inventoryInstance(
  parentService,
  "parent-1",
  { name: "edge-1", region: "eu" },
  { referenced_by: ["child-1"] }
);

/** A child instance that refers to the instance, so it is in the instance's `referenced_by`. */
const referringChild = inventoryInstance(childService, "child-1", {
  name: "leaf-1",
  parent_entity: instance.id,
});

/**
 * Serves the catalog, the instances by id (with `referenced_by` only when it's asked for, like
 * the API) and the inventory, and records the requests.
 */
const serveApi = () => {
  const requests = { catalog: 0, instance: [] as string[], inventory: [] as string[] };
  const byId = new Map([instance, referringChild].map((item) => [item.id, item]));

  server.use(
    http.get("/lsm/v1/service_catalog", () => {
      requests.catalog += 1;

      return HttpResponse.json({ data: serviceCatalog });
    }),
    http.get("/lsm/v1/service_inventory", ({ request }) => {
      const params = new URL(request.url).searchParams;
      const found = byId.get(params.get("service_id") ?? "");

      requests.instance.push(params.toString());

      if (!found) {
        return HttpResponse.json({ message: "not found" }, { status: 404 });
      }

      return HttpResponse.json({
        data: {
          ...found,
          referenced_by:
            params.get("include_referenced_by") === "true" ? found.referenced_by : null,
        },
      });
    }),
    http.get("/lsm/v1/service_inventory/:service", ({ params }) => {
      requests.inventory.push(String(params.service));

      return HttpResponse.json({ data: [], links: { self: "" } });
    })
  );

  return requests;
};

const server = setupTestServer();

/**
 * Renders the page with the lsm routes its actions link to (Cancel goes to the inventory).
 */
const renderPage = (page: React.ReactElement) =>
  render(
    baseSetup(page, [], [stubRoute("Dashboard"), stubRoute("Catalog"), stubRoute("Inventory")])
      .component
  );

describe("ComposerPage", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  afterAll(() => server.close());

  it("loads the catalog once, without polling, and the inventory only when the Inventory tab opens", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const requests = serveApi();

    renderPage(<ComposerPage serviceName={parentService.name} editable />);

    expect(await screen.findByTestId("palette-group-parent-service")).toBeVisible();
    expect(screen.getByText(words("instanceComposer.title"))).toBeVisible();

    // Longer than the poll interval of the queries
    await act(() => vi.advanceTimersByTimeAsync(6000));

    expect(requests.catalog).toBe(1);
    expect(requests.instance).toEqual([]);
    expect(requests.inventory).toEqual([]);

    const inventoryTab = screen.getByRole("tab", {
      name: words("instanceComposer.palette.tab.inventory"),
    });

    await user.click(inventoryTab);
    await waitFor(() => expect(requests.inventory).toHaveLength(serviceCatalog.length));

    await act(() => vi.advanceTimersByTimeAsync(6000));

    expect(requests.inventory).toHaveLength(serviceCatalog.length);

    await user.click(screen.getByRole("tab", { name: words("instanceComposer.palette.tab.new") }));
    await user.click(inventoryTab);

    await waitFor(() => expect(requests.inventory).toHaveLength(2 * serviceCatalog.length));
  });

  it("loads the instance to edit once, without the instances that refer to it", async () => {
    const requests = serveApi();

    renderPage(<ComposerPage serviceName={parentService.name} instanceId={instance.id} editable />);

    expect(await screen.findByText(words("instanceComposer.title.edit"))).toBeVisible();
    expect(await screen.findByText("edge-1")).toBeVisible();
    expect(screen.queryByText("leaf-1")).not.toBeInTheDocument();
    expect(requests.catalog).toBe(1);
    expect(requests.instance).toHaveLength(1);
    expect(requests.instance[0]).toContain("include_referenced_by=false");
  });

  it("shows the instances that refer to the instance in the viewer", async () => {
    const requests = serveApi();

    renderPage(
      <ComposerPage serviceName={parentService.name} instanceId={instance.id} editable={false} />
    );

    expect(await screen.findByText(words("instanceComposer.title.view"))).toBeVisible();
    expect(await screen.findByText("leaf-1")).toBeVisible();
    // The instance, then the child that refers to it
    expect(requests.instance).toHaveLength(2);
    expect(requests.instance[0]).toContain("include_referenced_by=true");
  });

  it("says when the service isn't in the catalog", async () => {
    serveApi();

    renderPage(<ComposerPage serviceName="unknown-service" editable />);

    expect(
      await screen.findByText(
        words("instanceComposer.noServiceModel.errorMessage")("unknown-service")
      )
    ).toBeVisible();
  });

  it("says the composer isn't enabled without its licence, and loads nothing", async () => {
    vi.spyOn(MockOrchestratorProvider.prototype, "isComposerEnabled").mockReturnValue(false);
    const requests = serveApi();

    renderPage(<ComposerPage serviceName={parentService.name} editable />);

    expect(await screen.findByText(words("instanceComposer.disabled"))).toBeVisible();
    expect(requests.catalog).toBe(0);
  });
});
