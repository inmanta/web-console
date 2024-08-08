import React, { act } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI";
import { ServiceInstanceDetails } from "../UI/Page";
import {
  defaultServer,
  errorServerHistory,
  errorServerInstance,
  loadingServer,
} from "./mockServer";

expect.extend(toHaveNoViolations);

const setup = () => {
  const queryClient = new QueryClient();
  const store = getStoreInstance();

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );
  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        settings: {
          enable_lsm_expert_mode: false,
        },
      },
    ]),
  );

  const component = (
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/lsm/catalog/mobileCore/inventory/core1/1d96a1ab/details",
          search: "?env=aaa",
        },
      ]}
    >
      <QueryClientProvider client={queryClient}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentHandler,
          }}
        >
          <StoreProvider store={store}>
            <Page>
              <ServiceInstanceDetails
                instance="core1"
                service="mobileCore"
                instanceId="1d96a1ab"
              />
            </Page>
          </StoreProvider>
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return component;
};

describe("ServiceInstanceDetailsPage", () => {
  it("Should render the view in its loading states", async () => {
    const server = loadingServer;
    server.listen();
    const component = setup();
    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "History-Loading" }),
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("Should render an error view when the query isError", async () => {
    const server = errorServerInstance;
    server.listen();
    const component = setup();
    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" }),
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    await waitFor(
      () => {
        const errorView = screen.getByRole("region", {
          name: "Instance-Details-Error",
        });
        expect(errorView).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    server.close();
  });

  it("Should render success view without config when there's instance data, but error view in the history section when there are no logs;", async () => {
    const server = errorServerHistory;
    server.listen();
    const component = setup();
    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "History-Loading" }),
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    await waitFor(
      () => {
        const historyErrorView = screen.getByRole("region", {
          name: "History-Error",
        });
        expect(historyErrorView).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    expect(
      screen.queryByRole("button", { name: "Config" }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Details" }),
    ).toBeInTheDocument();

    expect(screen.getByText("1d96a1ab")).toBeInTheDocument();

    server.close();
  });

  it("Should render a success view without config and update version tags based on selected version in history-section", async () => {
    const server = defaultServer;
    server.listen();
    const component = setup();
    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Latest Version")).toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 4",
    );

    await act(async () => {
      await userEvent.click(screen.getByRole("cell", { name: "2" }));
    });

    expect(screen.queryByText("Latest Version")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 2",
    );

    server.close();
  });

  // TODO: @LukasStordeur Implement test when config tab has usecases.
  //it("Should render a success view and with config section if present", async () => { });
});
