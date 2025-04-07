import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClientProvider, UseQueryResult } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import {
  InstanceWithRelations,
  Inventories,
} from "@/Data/Managers/V2/ServiceInstance";
import { dependencies } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import {
  CanvasContext,
  defaultCanvasContext,
  InstanceComposerContext,
} from "../Context";
import { childModel } from "../Mocks";
import { RelationCounterForCell } from "../interfaces";
import { ComposerActions } from "./ComposerActions";
const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("ComposerActions.", () => {
  const setup = (
    instanceWithRelations: InstanceWithRelations | null,
    canvasContext: typeof defaultCanvasContext,
    editable: boolean = true,
  ) => {
    const environmentHandler = EnvironmentHandlerImpl(
      useLocation,
      PrimaryRouteManager(""),
    );
    const store = getStoreInstance();

    const env = {
      id: "aaa",
      name: "env-a",
      project_id: "ppp",
      repo_branch: "branch",
      repo_url: "repo",
      projectName: "project",
      halted: false,
      settings: {},
    };

    store.dispatch.environment.setEnvironments(RemoteData.success([env]));

    store.dispatch.environment.setEnvironmentDetailsById({
      id: "aaa",
      value: RemoteData.success(env),
    });

    return (
      <QueryClientProvider client={testClient}>
        <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
          <StoreProvider store={store}>
            <DependencyProvider
              dependencies={{ ...dependencies, environmentHandler }}
            >
              <InstanceComposerContext.Provider
                value={{
                  serviceModels: [childModel],
                  instance: instanceWithRelations,
                  mainService: childModel,
                  relatedInventoriesQuery: {} as UseQueryResult<
                    Inventories,
                    Error
                  >,
                }}
              >
                <CanvasContext.Provider value={canvasContext}>
                  <ComposerActions
                    serviceName="child-service"
                    editable={editable}
                  />
                </CanvasContext.Provider>
              </InstanceComposerContext.Provider>
            </DependencyProvider>
          </StoreProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  const validContextForEnabledDeploy = {
    ...defaultCanvasContext,
    serviceOrderItems: new Map().set("13920268-cce0-4491-93b5-11316aa2fc37", {
      instance_id: "13920268-cce0-4491-93b5-11316aa2fc37",
      service_entity: "child-service",
      config: {},
      action: "create",
      attributes: {
        name: "test123456789",
        service_id: "123test",
        should_deploy_fail: false,
        parent_entity: "6af44f75-ba4b-4fba-9186-cc61c3c9463c",
      },
    }),
    diagramHandlers: {
      getCoordinates: jest.fn(),
      saveAndClearCanvas: jest.fn(),
      loadState: jest.fn(),
      addInstance: jest.fn(),
      editEntity: jest.fn(),
    } as typeof defaultCanvasContext.diagramHandlers,
    isDirty: true,
    looseElement: new Set<string>(),
    interServiceRelationsOnCanvas: new Map<string, RelationCounterForCell>(),
  };

  const server = setupServer(
    http.post(
      "/lsm/v1/service_inventory/child-service}/*/metadata/coordinates",
      async () => {
        return HttpResponse.json({
          data: [],
        });
      },
    ),
    http.post("/lsm/v2/order", async () => {
      return HttpResponse.json({
        data: [],
      });
    }),
  );

  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("should render the ComposerActions component", () => {
    render(setup(null, defaultCanvasContext));

    expect(screen.getByText("Cancel")).toBeVisible();
    expect(screen.getByText("Cancel")).toBeEnabled();

    expect(screen.getByRole("button", { name: "Deploy" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Deploy" })).toBeDisabled(); //for default canvas context deploy should be disabled by default
  });

  it.each`
    serviceOrderItems | isDirty  | looseElement             | editable | interServiceRelationsOnCanvas
    ${new Map()}      | ${true}  | ${null}                  | ${true}  | ${null}
    ${null}           | ${false} | ${null}                  | ${true}  | ${null}
    ${null}           | ${true}  | ${new Set().add("test")} | ${true}  | ${null}
    ${null}           | ${true}  | ${null}                  | ${false} | ${null}
    ${null} | ${true} | ${null} | ${true} | ${new Map().set("test_id", {
  name: "test",
  relations: [{ name: "relation-test", currentAmount: 0, min: 1 }],
})}
  `(
    "should have deploy button disabled when at least one of conditions are not met",
    ({
      serviceOrderItems,
      isDirty,
      looseElement,
      editable,
      interServiceRelationsOnCanvas,
    }) => {
      const canvasContext = {
        ...defaultCanvasContext,
        serviceOrderItems: serviceOrderItems || new Map().set("test", "test"),
        isDirty: isDirty,
        looseElement: looseElement || new Set<string>(),
        interServiceRelationsOnCanvas:
          interServiceRelationsOnCanvas ||
          new Map<string, RelationCounterForCell>(),
      };

      render(setup(null, canvasContext, editable));
      expect(screen.getByRole("button", { name: "Deploy" })).toBeDisabled();
    },
  );

  it("should have deploy button enabled when all conditions are met", () => {
    render(setup(null, validContextForEnabledDeploy));
    expect(screen.getByRole("button", { name: "Deploy" })).toBeEnabled();
  });

  it("shows success message and redirects when deploy button is clicked", async () => {
    server.use(
      http.post("/lsm/v2/order", async () => {
        return HttpResponse.json({
          data: {
            id: "test",
          },
        });
      }),
    );

    render(setup(null, validContextForEnabledDeploy));
    expect(screen.getByRole("button", { name: "Deploy" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Deploy" }));

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/order-details/test?env=aaa",
      ),
    );
  });

  it("shows error message about coordinates when there is no diagramHandlers", async () => {
    server.use(
      http.post("/lsm/v2/order", async () => {
        await delay();

        return HttpResponse.json({
          data: [],
        });
      }),
    );
    const canvasContext = {
      ...validContextForEnabledDeploy,
      diagramHandlers: null,
    };

    render(setup(null, canvasContext));
    expect(screen.getByRole("button", { name: "Deploy" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Deploy" }));

    expect(
      screen.getByText("Failed to save instance coordinates on deploy."),
    ).toBeVisible();
  });

  it("shows error message when deploy button is clicked and request fails", async () => {
    server.use(
      http.post("/lsm/v2/order", async () => {
        return HttpResponse.json(
          {
            message: "Failed to deploy instance.",
          },
          {
            status: 401,
          },
        );
      }),
    );

    render(setup(null, validContextForEnabledDeploy));
    expect(screen.getByRole("button", { name: "Deploy" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Deploy" }));

    expect(await screen.findByText("Failed to deploy instance.")).toBeVisible();
  });
});
