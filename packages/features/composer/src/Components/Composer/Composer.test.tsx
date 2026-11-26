import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { words } from "@inmanta/web-console-core";
import { baseSetup } from "@inmanta/web-console-test-utils/Utils/base-setup";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { Composer } from "./Composer";
import { serviceCatalog } from "./Mock/serviceModels";
import { LeftSidebar } from "./UI/LeftSidebar";
import { defineReactFlowTestObjects } from "./testSetup";

defineReactFlowTestObjects();

describe("Composer", () => {
  const server = setupTestServer();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
    vi.useRealTimers();
  });
  afterAll(() => server.close());

  it("fetches the inventory each time the palette's Inventory tab opens, and never polls it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const inventoryRequests: string[] = [];

    server.use(
      http.get("/lsm/v1/service_catalog", () => HttpResponse.json({ data: serviceCatalog })),
      http.get("/lsm/v1/service_inventory/:service", ({ params }) => {
        inventoryRequests.push(String(params.service));

        return HttpResponse.json({ data: [], links: { self: "" } });
      })
    );

    render(
      baseSetup(
        <Composer editable serviceName={serviceCatalog[0].name}>
          <LeftSidebar />
        </Composer>
      ).component
    );

    expect(await screen.findByTestId("palette-group-parent-service")).toBeVisible();

    // Longer than the poll interval it used to have
    await act(() => vi.advanceTimersByTimeAsync(6000));

    expect(inventoryRequests).toEqual([]);

    const inventoryTab = screen.getByRole("tab", {
      name: words("instanceComposer.stencil.inventory"),
    });

    await user.click(inventoryTab);
    await waitFor(() => expect(inventoryRequests).toHaveLength(serviceCatalog.length));

    await act(() => vi.advanceTimersByTimeAsync(6000));

    expect(inventoryRequests).toHaveLength(serviceCatalog.length);

    await user.click(screen.getByRole("tab", { name: words("instanceComposer.stencil.new") }));
    await user.click(inventoryTab);

    await waitFor(() => expect(inventoryRequests).toHaveLength(2 * serviceCatalog.length));
  });
});
