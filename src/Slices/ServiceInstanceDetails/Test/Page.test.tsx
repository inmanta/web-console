import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  defaultServer,
  errorServerHistory,
  errorServerInstance,
  loadingServer,
  serverWithDocumentation,
} from "./mockServer";
import { setupServiceInstanceDetails } from "./mockSetup";

expect.extend(toHaveNoViolations);

describe("ServiceInstanceDetailsPage", () => {
  it("Should render the view in its loading states", async () => {
    const server = loadingServer;

    server.listen();
    const component = setupServiceInstanceDetails();

    render(component);

    expect(screen.getByRole("region", { name: "Instance-Details-Loading" })).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "History-Loading" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    server.close();
  });

  it("Should render an error view when the query isError", async () => {
    const server = errorServerInstance;

    server.listen();
    const component = setupServiceInstanceDetails();

    render(component);

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
      { timeout: 8000 }
    );

    server.close();
  });

  it("Should render success view without config when there's instance data, but error view in the history section when there are no logs", async () => {
    const server = errorServerHistory;

    server.listen();
    const component = setupServiceInstanceDetails();

    render(component);

    expect(screen.getByRole("region", { name: "Instance-Details-Loading" })).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
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
      { timeout: 8000 }
    );

    expect(screen.queryByRole("button", { name: "Config" })).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Details" })).toBeInTheDocument();

    expect(screen.getByText("1d96a1ab")).toBeInTheDocument();

    server.close();
  });

  it("Should render a success view without config", async () => {
    const server = defaultServer;

    server.listen();
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // Test that the table has collapsibles
    // this value is located inside the collapsible section.
    expect(screen.getByText(/inmanta\-lab/i)).not.toBeVisible();

    await userEvent.click(
      screen.getByRole("button", {
        name: /expand row 1/i,
      })
    );

    // In Version 4, the site.name should be "inmanta-lab".
    // assert that we can see the site values now.
    expect(screen.getByText(/inmanta\-lab/i)).toBeVisible();

    // Test the sorting and expand/collapse all
    const sortToggle = screen.getByRole("button", {
      name: /attribute/i,
    });

    await userEvent.click(sortToggle);

    const rowKeys = screen.getAllByTestId("attribute-key");

    expect(rowKeys[0]).toHaveTextContent("epc_version");

    const tableOptionsToggle = screen.getByRole("button", {
      name: /table\-options/i,
    });

    await userEvent.click(tableOptionsToggle);

    const tableOptions1 = screen.getAllByRole("menuitem");

    expect(tableOptions1).toHaveLength(3);
    // collapse all
    await userEvent.click(tableOptions1[0]);

    expect(screen.getByText(/inmanta\-lab/i)).not.toBeVisible();

    await userEvent.click(tableOptionsToggle);

    const tableOptions2 = screen.getAllByRole("menuitem");

    expect(tableOptions2).toHaveLength(3);
    // revert sorting
    await userEvent.click(tableOptions2[2]);

    const rowKeysResetted = screen.getAllByTestId("attribute-key");

    expect(rowKeysResetted[0]).toHaveTextContent("name");

    await userEvent.click(tableOptionsToggle);

    const tableOptions3 = screen.getAllByRole("menuitem");

    expect(tableOptions3).toHaveLength(3);
    // expand all
    await userEvent.click(tableOptions3[1]);

    expect(screen.getByText(/inmanta\-lab/i)).toBeVisible();

    // Test that it only has active and candidate attributes for this version
    const select = screen.getByRole("combobox", {
      name: /select\-attributeset/i,
    });

    // change the attributeSet to candidate.
    await userEvent.click(select);
    const options1 = screen.getAllByRole("option");

    // expect only two options, active and candidate
    expect(options1).toHaveLength(2);
    const candidate_option = options1[1];

    await userEvent.selectOptions(select, candidate_option);
    expect(select).toHaveValue("candidate_attributes");

    await userEvent.click(screen.getByRole("cell", { name: "2" }));

    expect(screen.queryByText("Latest Version")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-version")).toHaveTextContent("Version: 2");

    // second Version has only a candidate set
    const select2 = screen.getByRole("combobox", {
      name: /select\-attributeset/i,
    });

    await userEvent.click(select2);
    const options2 = screen.getAllByRole("option");

    // expect only one options, candidate
    expect(options2).toHaveLength(1);
    expect(select2).toHaveValue("candidate_attributes");

    // In Version 2, the site.name should be "inmanta-lab-0".
    expect(screen.getByText("inmanta-lab-0")).toBeVisible();

    // Go to the JSON view
    const toggleJson = screen.getByText(/json/i);

    await userEvent.click(toggleJson);

    // We can't test the monaco editor in jest, this is covered in the E2E cases.
    // We can just test that the dropdown is now pressent too and set on the candidate set.
    expect(
      screen.getByRole("combobox", {
        name: /select\-attributeset/i,
      })
    ).toHaveValue("candidate_attributes");

    // go back to the latest version
    await userEvent.click(screen.getByRole("cell", { name: "4" }));

    // Change view on compare, and just like before, we can't test the monaco editor in jest,
    // so we will assert that we now have 4 dropdowns
    const toggleCompare = screen.getByText(/compare/i);

    await userEvent.click(toggleCompare);

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
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // active attribute set. By default, the latest version is selected, and shouldn't display a label.
    expect(screen.queryByTestId("selected-version")).not.toBeInTheDocument();

    // should display the right timestamp in the rows for each version
    expect(screen.getByTestId("version-4-timestamp")).toHaveTextContent("2022/09/02 14:01:19");
    expect(screen.getByTestId("version-3-timestamp")).toHaveTextContent("2022/09/02 13:56:16");

    expect(screen.getByText("Documentation")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Getting started/i,
      })
    ).toBeVisible();

    // candidate attribute set
    // in this version, we should have documentation available
    await userEvent.click(screen.getByRole("cell", { name: "3" }));

    expect(screen.getByTestId("selected-version")).toHaveTextContent("Version: 3");

    expect(
      screen.getByRole("heading", {
        name: /we are adding documentation/i,
      })
    ).toBeVisible();

    // rollback attribute set
    // in this version, topography documentation is an empty string, so fall back to message informing the user.
    await userEvent.click(screen.getByRole("cell", { name: "2" }));

    expect(screen.getByTestId("selected-version")).toHaveTextContent("Version: 2");

    expect(
      screen.getByText(/this version doesn’t contain documentation for topography yet\./i)
    ).toBeVisible();

    // in this version, topography attribute didn't exist yet in any attribute set, but is available in the ServiceModel.
    await userEvent.click(screen.getByRole("cell", { name: "1" }));

    expect(screen.getByTestId("selected-version")).toHaveTextContent("Version: 1");

    expect(
      screen.getByText(/this version doesn’t contain documentation for topography yet\./i)
    ).toBeVisible();

    // Events

    // Select the Events tab
    await userEvent.click(screen.getByText("Events"));

    // Should have a link to navigate to the full events page
    const allEventsLink = screen.getByRole("link", {
      name: /see all events/i,
    });

    expect(allEventsLink).toBeVisible();

    // Should have the right href attribute
    expect(allEventsLink).toHaveAttribute(
      "href",
      "/lsm/catalog/mobileCore/inventory/1d96a1ab/events?env=aaa&state.InstanceDetails.version=1&state.InstanceDetails.tab=Events"
    );

    // In this version, expect only two rows with aria-label Event table row
    expect(
      screen.getAllByRole("row", {
        name: /Event\-table\-row/i,
      })
    ).toHaveLength(2);

    // The source state should be empty since this is the very first version and thus only has a target-state.
    expect(
      screen.getByRole("cell", {
        name: /event\-source\-0/i,
      })
    ).toBeEmptyDOMElement();
    expect(
      screen.getByRole("cell", {
        name: /event\-source\-1/i,
      })
    ).toBeEmptyDOMElement();

    // both should have the same target state "start"
    expect(
      screen.getByRole("cell", {
        name: /event\-target\-0/i,
      })
    ).toHaveTextContent(/start/i);
    expect(
      screen.getByRole("cell", {
        name: /event\-target\-1/i,
      })
    ).toHaveTextContent(/start/i);

    // the timestamps should be up to three fractions seconds
    expect(
      screen.getByRole("cell", {
        name: /event\-date\-0/i,
      })
    ).toHaveTextContent(/2022\/09\/02 13:56:856/i);
    expect(
      screen.getByRole("cell", {
        name: /event\-date\-1/i,
      })
    ).toHaveTextContent(/2022\/09\/02 13:56:840/i);

    // expect that there are no compile reports available for these rows
    expect(
      screen.getByRole("cell", {
        name: /event\-compile\-0/i,
      })
    ).toBeEmptyDOMElement();
    expect(
      screen.getByRole("cell", {
        name: /event\-compile\-1/i,
      })
    ).toBeEmptyDOMElement();

    // Select the version 3rd in the history, this one should contain three rows, and have one with a warning color, one with a validation report, and one with an export report.
    await userEvent.click(screen.getByRole("cell", { name: "3" }));

    const rowsVersion3 = screen.getAllByRole("row", {
      name: /Event\-table\-row/i,
    });

    expect(rowsVersion3).toHaveLength(3);

    expect(rowsVersion3[0]).toHaveStyle(
      "background-color: var(--pf-t--global--color--status--warning--default)"
    );
    expect(rowsVersion3[1]).not.toHaveStyle("background-color: inherit");
    expect(rowsVersion3[2]).not.toHaveStyle("background-color: inherit");

    expect(
      screen.getByRole("cell", {
        name: /event\-compile\-0/i,
      })
    ).toHaveTextContent(/validation/i);
    expect(
      screen.getByRole("cell", {
        name: /event\-compile\-1/i,
      })
    ).toHaveTextContent(/export/i);
    expect(
      screen.getByRole("cell", {
        name: /event\-compile\-2/i,
      })
    ).toBeEmptyDOMElement();

    expect(
      screen.getByRole("cell", {
        name: /event\-target\-0/i,
      })
    ).toHaveTextContent(/creating/i);
    expect(
      screen.getByRole("cell", {
        name: /event\-source\-0/i,
      })
    ).toHaveTextContent(/acknowledged/i);

    // Resources Tab

    // Make sure the version is set to latest
    await userEvent.click(screen.getAllByLabelText("History-Row")[0]);

    // Select the Resources tab
    await userEvent.click(screen.getByText("Resources"));

    expect(screen.getByText("Deployment Progress")).toBeVisible();
    expect(screen.getByText("1 / 1")).toBeVisible();
    expect(screen.getByLabelText("LegendItem-deployed")).toHaveTextContent("1");

    expect(screen.getByText("Resource")).toBeVisible();
    expect(screen.getByText("State")).toBeVisible();

    expect(screen.getByTestId("Status-deployed")).toBeVisible();

    expect(screen.getByText("test_resource[]")).toBeVisible();

    // Change Version to older
    await userEvent.click(screen.getAllByLabelText("History-Row")[1]);

    expect(screen.queryByText("Latest Version")).toBeNull();
    expect(screen.getByRole("tab", { name: "resources-content" })).toBeDisabled();

    expect(screen.getByTestId("Status-deployed")).not.toBeVisible();

    expect(screen.getByText("test_resource[]")).not.toBeVisible();

    // Change Version to latest
    await userEvent.click(screen.getAllByLabelText("History-Row")[0]);

    expect(screen.getByRole("tab", { name: "resources-content" })).toBeEnabled();

    server.close();
  }, 20000);
});
