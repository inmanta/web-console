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
  serverWithDocumentation,
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

  it("Should render a success view without config", async () => {
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

    // Test that the table has collapsibles
    // this value is located inside the collapsible section.
    expect(screen.getByText(/inmanta\-lab/i)).not.toBeVisible();

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", {
          name: /expand row 1/i,
        }),
      );
    });

    // In Version 4, the site.name should be "inmanta-lab".
    // assert that we can see the site values now.
    expect(screen.getByText(/inmanta\-lab/i)).toBeVisible();

    // Test the sorting and expand/collapse all
    const sortToggle = screen.getByRole("button", {
      name: /attribute/i,
    });

    await act(async () => {
      await userEvent.click(sortToggle);
    });

    const rowKeys = screen.getAllByTestId("attribute-key");

    expect(rowKeys[0]).toHaveTextContent("epc_version");

    const tableOptionsToggle = screen.getByRole("button", {
      name: /table\-options/i,
    });

    await act(async () => {
      await userEvent.click(tableOptionsToggle);
    });

    await act(async () => {
      const tableOptions = screen.getAllByRole("menuitem");

      expect(tableOptions).toHaveLength(3);
      // collapse all
      await userEvent.click(tableOptions[0]);
    });

    expect(screen.getByText(/inmanta\-lab/i)).not.toBeVisible();

    await act(async () => {
      await userEvent.click(tableOptionsToggle);
    });

    await act(async () => {
      const tableOptions = screen.getAllByRole("menuitem");

      expect(tableOptions).toHaveLength(3);
      // revert sorting
      await userEvent.click(tableOptions[2]);
    });

    const rowKeysResetted = screen.getAllByTestId("attribute-key");

    expect(rowKeysResetted[0]).toHaveTextContent("name");

    await act(async () => {
      await userEvent.click(tableOptionsToggle);
    });

    await act(async () => {
      const tableOptions = screen.getAllByRole("menuitem");

      expect(tableOptions).toHaveLength(3);
      // expand all
      await userEvent.click(tableOptions[1]);
    });

    expect(screen.getByText(/inmanta\-lab/i)).toBeVisible();

    // Test that it only has active and candidate attributes for this version
    const select = screen.getByRole("combobox", {
      name: /select\-attributeset/i,
    });

    // change the attributeSet to candidate.
    await act(async () => {
      await userEvent.click(select);
      const options = screen.getAllByRole("option");

      // expect only two options, active and candidate
      expect(options).toHaveLength(2);
      const candidate_option = options[1];

      await userEvent.selectOptions(select, candidate_option);
      expect(select).toHaveValue("candidate_attributes");
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("cell", { name: "2" }));
    });

    expect(screen.queryByText("Latest Version")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 2",
    );

    // second Version has only a candidate set
    const select2 = screen.getByRole("combobox", {
      name: /select\-attributeset/i,
    });

    await act(async () => {
      await userEvent.click(select2);
      const options = screen.getAllByRole("option");

      // expect only one options, candidate
      expect(options).toHaveLength(1);
      expect(select2).toHaveValue("candidate_attributes");
    });

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", {
          name: /expand row 1/i,
        }),
      );
    });

    // In Version 2, the site.name should be "inmanta-lab-0".
    expect(screen.getByText("inmanta-lab-0")).toBeVisible();

    // Go to the JSON view
    const toggleJson = screen.getByText(/json\-editor/i);

    await act(async () => {
      await userEvent.click(toggleJson);
    });

    // expect the view to be updated
    expect(screen.getByTestId("loading-spinner")).toBeVisible();

    // We can't test the monaco editor in jest yet, this is covered in the E2E cases.
    // We can just test that the dropdown is now pressent too and set on the candidate set.
    expect(
      screen.getByRole("combobox", {
        name: /select\-attributeset/i,
      }),
    ).toHaveValue("candidate_attributes");

    // go back to the latest version
    await act(async () => {
      await userEvent.click(screen.getByRole("cell", { name: "4" }));
    });

    // Change view on compare, and just like before, we can't test the monaco editor in jest,
    // so we will assert that we now have 4 dropdowns
    const toggleCompare = screen.getByText(/compare/i);

    await act(async () => {
      await userEvent.click(toggleCompare);
    });

    const selects = screen.getAllByRole("combobox");

    expect(selects).toHaveLength(4);
    expect(selects[0]).toHaveValue("4");
    expect(selects[1]).toHaveValue("active_attributes");
    expect(selects[2]).toHaveValue("4");
    // by default, if a candidate set is available it will set it to compare
    expect(selects[3]).toHaveValue("candidate_attributes");

    // There shouldn't be a documentation tab for this Instance and ServiceModel
    expect(screen.queryByText("Documentation")).not.toBeInTheDocument();

    server.close();
  });

  // TODO: @LukasStordeur Implement test when config tab has usecases.
  //it("Should render a success view and with config section if present", async () => { });

  it("Should render a success view with documentation", async () => {
    const server = serverWithDocumentation;

    server.listen();
    const component = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" }),
    ).toBeInTheDocument();

    // active attribute set
    // in this version, we should have documentation available
    expect(screen.getByText("Latest Version")).toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 4",
    );

    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByText("Topography")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /we are adding documentation/i,
      }),
    ).toBeVisible();

    // candidate attribute set
    // in this version, we should have documentation available
    await act(async () => {
      await userEvent.click(screen.getByRole("cell", { name: "3" }));
    });

    expect(screen.queryByText("Latest Version")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 3",
    );

    expect(screen.getByText("Topography")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /we are adding documentation/i,
      }),
    ).toBeVisible();

    // rollback attribute set
    // in this version, topography documentation is an empty string, so fall back to message informing the user.
    await act(async () => {
      await userEvent.click(screen.getByRole("cell", { name: "2" }));
    });

    expect(screen.queryByText("Latest Version")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 2",
    );

    expect(screen.getByText("Topography")).toBeInTheDocument();
    expect(
      screen.getByText(
        /this version doesn’t contain documentation for topography yet\./i,
      ),
    ).toBeVisible();

    // in this version, topography attribute didn't exist yet in any attribute set, but is available in the ServiceModel.
    await act(async () => {
      await userEvent.click(screen.getByRole("cell", { name: "1" }));
    });

    expect(screen.queryByText("Latest Version")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent(
      "Version: 1",
    );

    expect(screen.getByText("Topography")).toBeInTheDocument();
    expect(
      screen.getByText(
        /this version doesn’t contain documentation for topography yet\./i,
      ),
    ).toBeVisible();

    // Topography should be a collapsible section.
    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", {
          name: "Topography",
        }),
      );
    });

    expect(
      screen.getByText(
        /this version doesn’t contain documentation for topography yet\./i,
      ),
    ).not.toBeVisible();

    server.close();
  });
});
