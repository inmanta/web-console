import React from "react";
import { Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import "@testing-library/jest-dom";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { childModel, containerModel, mockedInstanceWithRelations, parentModel } from "../Mocks";
import { defineObjectsForJointJS } from "../testSetup";
import { ComposerEditorProvider } from "./ComposerEditorProvider";

const setup = (instanceId: string, editable: boolean = true) => {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter
        initialEntries={[
          "/lsm/catalog/child-service/inventory/13920268-cce0-4491-93b5-11316aa2fc37/edit?env=aaa",
        ]}
      >
        <MockedDependencyProvider>
          <Routes>
            <Route
              path="/lsm/catalog/child-service/inventory/:instanceId/edit"
              element={
                <ComposerEditorProvider
                  serviceName={"child-service"}
                  editable={editable}
                  instance={instanceId}
                />
              }
            />
            <Route
              path="/lsm/catalog/child-service/inventory"
              element={<div data-testid="inventory-page" />}
            />
            <Route path="/" element={<div data-testid="root-page" />} />
          </Routes>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
};

const server = setupServer(
  http.get("/lsm/v1/service_catalog", async () => {
    return HttpResponse.json({
      data: [parentModel, childModel, containerModel],
    });
  }),
  http.get("/lsm/v1/service_inventory", async () => {
    return HttpResponse.json({
      data: mockedInstanceWithRelations.interServiceRelations[0], // child-service instance
    });
  }),
  http.get("/lsm/v1/service_inventory/parent-service", async () => {
    return HttpResponse.json({
      data: [],
    });
  })
);

describe("ComposerEditorProvider", () => {
  beforeAll(() => {
    defineObjectsForJointJS();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("if there is error when fetching service models the error view is shown", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", async () => {
        return HttpResponse.json({ message: "Something went wrong" }, { status: 400 });
      })
    );

    render(setup("13920268-cce0-4491-93b5-11316aa2fc37"));

    expect(
      await screen.findByRole("region", {
        name: "ComposerEditorProvider-Loading",
      })
    ).toBeInTheDocument();

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerEditorProvider-ServiceModelsQuery_failed",
      })
    ).toBeInTheDocument();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("if there is error when fetching related inventories the error view is shown", async () => {
    render(setup("13920268-cce0-4491-93b5-11316aa2fc37"));

    server.use(
      http.get("/lsm/v1/service_inventory/parent-service", async () => {
        return HttpResponse.json({ message: "Something went wrong" }, { status: 400 });
      })
    );

    expect(
      await screen.findByRole("region", {
        name: "ComposerEditorProvider-Loading",
      })
    ).toBeInTheDocument();

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerEditorProvider-RelatedInventoriesQuery_failed",
      })
    ).toBeInTheDocument();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("if there is error when fetching instance with relations the error view is shown", async () => {
    render(setup("13920268-cce0-4491-93b5-11316aa2fc37"));

    server.use(
      http.get("/lsm/v1/service_inventory", async () => {
        return HttpResponse.json({ message: "Something went wrong" }, { status: 400 });
      })
    );

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerEditorProvider-InstanceWithRelationsQuery_failed",
      })
    ).toBeInTheDocument();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("if there is error no main service model the error view is shown", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", async () => {
        return HttpResponse.json({
          data: [parentModel, containerModel],
        });
      })
    );

    render(setup("13920268-cce0-4491-93b5-11316aa2fc37"));

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerEditorProvider-NoServiceModel_failed",
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByText("There is no service model available for child-service")
    ).toBeInTheDocument();
  });

  it("if provider is editable show Instance Composer Editor title ", async () => {
    render(setup("13920268-cce0-4491-93b5-11316aa2fc37"));

    const title = await screen.findByText("Instance Composer Editor");

    expect(title).toBeInTheDocument();
  });

  it("if provider is not editable show Instance Composer Viewer title ", async () => {
    render(setup("13920268-cce0-4491-93b5-11316aa2fc37", false));

    const title = await screen.findByText("Instance Composer Viewer");

    expect(title).toBeInTheDocument();
  });

  it("navigating out of the View works correctly", async () => {
    render(setup("13920268-cce0-4491-93b5-11316aa2fc37"));

    const composer = await screen.findByTestId("Composer-Container");

    expect(composer).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(await screen.findByTestId("inventory-page")).toBeInTheDocument();
  });
});
