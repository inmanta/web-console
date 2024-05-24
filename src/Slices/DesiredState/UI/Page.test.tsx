import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either, Maybe } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  PromoteVersionCommandManager,
  DesiredStatesUpdater,
  GetCompilerStatusQueryManager,
  TriggerCompileCommandManager,
} from "@/Data";
import { DeleteVersionCommandManager } from "@/Data/Managers/DeleteVersion";
import {
  DynamicQueryManagerResolverImpl,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolverImpl,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import {
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
} from "@S/DesiredState/Data";
import * as DesiredStateVersions from "@S/DesiredState/Data/Mock";
import { Page } from "./Page";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const getDesiredStatesStateHelper = GetDesiredStatesStateHelper(store);
  const desiredStatesUpdater = new DesiredStatesUpdater(
    getDesiredStatesStateHelper,
    apiHelper,
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      GetDesiredStatesQueryManager(
        apiHelper,
        getDesiredStatesStateHelper,
        scheduler,
      ),
      GetCompilerStatusQueryManager(apiHelper, scheduler),
    ]),
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([
      PromoteVersionCommandManager(apiHelper, desiredStatesUpdater),
      DeleteVersionCommandManager(apiHelper),
      TriggerCompileCommandManager(apiHelper),
    ]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
        }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("DesiredStatesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("region", { name: "DesiredStatesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [],
        links: { self: "" },
        metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
      }),
    );
  });

  expect(
    await screen.findByRole("generic", { name: "DesiredStatesView-Empty" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("DesiredStatesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("region", { name: "DesiredStatesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    await screen.findByRole("region", { name: "DesiredStatesView-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("AgentsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("region", { name: "DesiredStatesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  expect(
    await screen.findByRole("grid", { name: "DesiredStatesView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("When using the status filter then only the matching desired states should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  expect(initialRows).toHaveLength(9);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.status"),
      }),
    );
  });

  const input = screen.getByRole("combobox", { name: "StatusFilterInput" });
  await act(async () => {
    await userEvent.click(input);
  });

  const statusOptions = screen.getAllByRole("option");
  expect(statusOptions).toHaveLength(4);

  const candidateSkippedOption = await screen.findByRole("option", {
    name: words("desiredState.test.skippedCandidate"),
  });
  await act(async () => {
    await userEvent.click(candidateSkippedOption);
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=skipped_candidate`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...DesiredStateVersions.response,
        data: DesiredStateVersions.response.data.slice(0, 3),
      }),
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("When using the Date filter then the desired state versions within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  expect(initialRows).toHaveLength(9);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", { name: words("desiredState.columns.date") }),
    );
  });

  const fromDatePicker = screen.getByLabelText("From Date Picker");
  await act(async () => {
    await userEvent.click(fromDatePicker);
  });
  await act(async () => {
    await userEvent.type(fromDatePicker, `2021-12-06`);
  });

  const toDatePicker = screen.getByLabelText("To Date Picker");
  await act(async () => {
    await userEvent.click(toDatePicker);
  });
  await act(async () => {
    await userEvent.type(toDatePicker, "2021-12-07");
  });

  await act(async () => {
    await userEvent.click(screen.getByLabelText("Apply date filter"));
  });
  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.date=ge%3A2021-12-05%2B23%3A00%3A00&filter.date=le%3A2021-12-06%2B23%3A00%3A00`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...DesiredStateVersions.response,
        data: DesiredStateVersions.response.data.slice(0, 3),
      }),
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  await act(async () => {
    window.dispatchEvent(new Event("resize"));
  });

  expect(
    await screen.findByText("from | 2021/12/06 00:00:00", { exact: false }),
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2021/12/07 00:00:00", { exact: false }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("When using the Version filter then the desired state versions within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  expect(initialRows).toHaveLength(9);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.version"),
      }),
    );
  });

  const fromDatePicker = await screen.findByLabelText("Version range from");
  await act(async () => {
    await userEvent.click(fromDatePicker);
  });
  await act(async () => {
    await userEvent.type(fromDatePicker, `3`);
  });

  const toDatePicker = await screen.findByLabelText("Version range to");
  await act(async () => {
    await userEvent.click(toDatePicker);
  });
  await act(async () => {
    await userEvent.type(toDatePicker, `5`);
  });

  await act(async () => {
    await userEvent.click(await screen.findByLabelText("Apply Version filter"));
  });
  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.version=ge%3A3&filter.version=le%3A5`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...DesiredStateVersions.response,
        data: DesiredStateVersions.response.data.slice(0, 3),
      }),
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  await act(async () => {
    await window.dispatchEvent(new Event("resize"));
  });

  expect(await screen.findByText("from | 3", { exact: false })).toBeVisible();
  expect(await screen.findByText("to | 5", { exact: false })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Given the Desired states view When promoting a version, then the correct request is be fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  await act(async () => {
    await userEvent.click(
      within(rows[8]).getByRole("button", {
        name: "actions-toggle",
      }),
    );
  });

  expect(
    within(rows[8]).getByRole("button", {
      name: "actions-toggle",
    }),
  ).toHaveAttribute("aria-expanded", "true");

  expect(
    screen.getByRole("menuitem", {
      name: words("desiredState.actions.promote"),
    }),
  ).toBeDisabled();

  await act(async () => {
    await userEvent.click(
      within(rows[0]).getByRole("button", {
        name: "actions-toggle",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: words("desiredState.actions.promote"),
      }),
    );
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);

  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/desiredstate/9/promote",
    body: null,
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(0);

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Given the Desired states view with filters When promoting a version, then the correct request is be fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.status"),
      }),
    );
  });

  const input = screen.getByPlaceholderText(
    words("desiredState.filters.status.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });

  const option = await screen.findByRole("option", {
    name: words("desiredState.test.candidate"),
  });
  await act(async () => {
    await userEvent.click(option);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  await act(async () => {
    await userEvent.click(
      within(rows[0]).getByRole("button", {
        name: "actions-toggle",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: words("desiredState.actions.promote"),
      }),
    );
  });
  expect(apiHelper.pendingRequests).toHaveLength(1);

  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/desiredstate/9/promote",
    body: null,
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=candidate",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  expect(apiHelper.resolvedRequests).toHaveLength(5);
  expect(apiHelper.pendingRequests).toHaveLength(0);

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Given the Desired states view When promoting a version results in an error, then the error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  await act(async () => {
    await userEvent.click(
      within(rows[0]).getByRole("button", {
        name: "actions-toggle",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: words("desiredState.actions.promote"),
      }),
    );
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);

  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/desiredstate/9/promote",
    body: null,
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.some("something happened"));
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  expect(await screen.findByText("something happened")).toBeVisible();
});

test("DesiredStatesView shows CompileWidget", async () => {
  const { component } = setup();
  render(component);

  expect(screen.getByRole("button", { name: "RecompileButton" })).toBeVisible();
});

describe("DeleteModal ", () => {
  it("Shows form when clicking on modal button", async () => {
    const { component, apiHelper } = setup();
    render(component);

    await act(async () => {
      await apiHelper.resolve(204);
    });

    await act(async () => {
      await apiHelper.resolve(Either.right(DesiredStateVersions.response));
    });
    const rows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    await act(async () => {
      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        }),
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    });

    expect(
      await screen.findByText(words("inventory.deleteVersion.header")(9)),
    ).toBeVisible();
    expect(await screen.findByText("Yes")).toBeVisible();
    expect(await screen.findByText("No")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  it("Closes modal when cancelled(both cancel buttons scenario)", async () => {
    const { component, apiHelper } = setup();
    render(component);

    await act(async () => {
      await apiHelper.resolve(204);
    });

    await act(async () => {
      await apiHelper.resolve(Either.right(DesiredStateVersions.response));
    });
    const rows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    //close by "no" button scenario
    await act(async () => {
      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        }),
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    });
    const noButton = await screen.findByText("No");
    await act(async () => {
      await userEvent.click(noButton);
    });

    expect(screen.queryByText("Yes")).not.toBeInTheDocument();

    //close by close button scenario
    await act(async () => {
      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        }),
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    });

    const closeButton = await screen.findByLabelText("Close");
    await act(async () => {
      await userEvent.click(closeButton);
    });

    expect(screen.queryByText("Yes")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  it("Sends request when submitted then request is executed and modal closed", async () => {
    const { component, apiHelper } = setup();
    render(component);

    await act(async () => {
      await apiHelper.resolve(204);
    });

    await act(async () => {
      await apiHelper.resolve(Either.right(DesiredStateVersions.response));
    });
    const rows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(rows).toHaveLength(9);

    await act(async () => {
      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        }),
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    });
    const yesButton = await screen.findByText("Yes");
    await act(async () => {
      await userEvent.click(yesButton);
    });

    expect(apiHelper.pendingRequests[0]).toEqual({
      environment: "env",
      method: "DELETE",
      url: `/api/v1/version/9`,
    });

    await act(async () => {
      await apiHelper.resolve(Either.right(null));
    });

    expect(screen.queryByText("No")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });
});
