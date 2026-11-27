import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { ServiceOrderItemRequest, words } from "@inmanta/web-console-core";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { baseSetup } from "@inmanta/web-console-test-utils/Utils/base-setup";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import { inventoryInstance, parentService } from "../Mock/serviceModels";
import { instanceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { ComposerActions } from "./ComposerActions";

defineReactFlowTestObjects();

const server = setupTestServer();

describe("ComposerActions", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  it("saves the card positions with the edited instance's id and version when it deploys", async () => {
    const instance = inventoryInstance(
      parentService,
      "parent-1",
      { name: "edge-1", region: "eu" },
      { version: 7 }
    );
    const orderItem: ServiceOrderItemRequest = {
      instance_id: instance.id,
      service_entity: parentService.name,
      config: null,
      action: "update",
    };
    const metadataRequests: Array<{ params: Record<string, unknown>; body: unknown }> = [];

    server.use(
      http.post(
        "/lsm/v1/service_inventory/:service/:id/metadata/:key",
        async ({ params, request }) => {
          metadataRequests.push({ params, body: await request.json() });

          return HttpResponse.json({});
        }
      ),
      // The order itself isn't what this test is about; a failed order doesn't navigate away.
      http.post("/lsm/v2/order", () => HttpResponse.json({ message: "no" }, { status: 500 }))
    );

    render(
      baseSetup(
        <ComposerTestProvider
          shapes={toCanvasState(...instanceShapes(instance, parentService))}
          serviceInstance={instance}
          serviceOrderItems={new Map([[instance.id, orderItem]])}
        >
          <ComposerActions serviceName={parentService.name} editable />
        </ComposerTestProvider>,
        [],
        [stubRoute("Dashboard"), stubRoute("Catalog"), stubRoute("Inventory")]
      ).component
    );

    await userEvent.click(screen.getByRole("button", { name: words("deploy") }));

    await waitFor(() => expect(metadataRequests).toHaveLength(1));
    expect(metadataRequests[0].params).toEqual({
      service: parentService.name,
      id: instance.id,
      key: "coordinates",
    });
    expect(metadataRequests[0].body).toMatchObject({ current_version: instance.version });
  });
});
