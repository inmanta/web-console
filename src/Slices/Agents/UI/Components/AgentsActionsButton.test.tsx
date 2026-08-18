import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { AgentsActionsButton } from "./AgentsActionsButton";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup(halted: boolean = false, isDisabled: boolean = false) {
  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
        <ModalProvider>
          <AgentsActionsButton isDisabled={isDisabled} />
        </ModalProvider>
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component };
}

async function openDropdown() {
  await userEvent.click(screen.getByRole("button", { name: words("agents.actions.menu.label") }));
}

describe("AgentsActionsButton", () => {
  const server = setupServer();

  beforeAll(() => server.listen());

  beforeEach(() => {
    server.resetHandlers();
  });
  afterEach(cleanup);

  afterAll(() => {
    server.close();
  });

  test("Given the dropdown, when the environment is not halted, it shows the pause/resume/venv actions but not the on-resume actions", async () => {
    const { component } = setup();

    render(component);

    await openDropdown();

    expect(screen.getByRole("menuitem", { name: words("agents.actions.pauseAll") })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: words("agents.actions.resumeAll") })).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.removeAllVenvs") })
    ).toBeVisible();
    expect(
      screen.queryByRole("menuitem", { name: words("agents.actions.keepPausedOnResumeAll") })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: words("agents.actions.unpauseOnResumeAll") })
    ).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the dropdown, when the environment is halted, it also shows the on-resume actions", async () => {
    const { component } = setup(true);

    render(component);

    await openDropdown();

    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.keepPausedOnResumeAll") })
    ).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.unpauseOnResumeAll") })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each([
    ["pause", "agents.actions.pauseAll", "agents.actions.pauseAll.requested", false],
    ["unpause", "agents.actions.resumeAll", "agents.actions.resumeAll.requested", false],
    [
      "keep_paused_on_resume",
      "agents.actions.keepPausedOnResumeAll",
      "agents.actions.keepPausedOnResumeAll.requested",
      true,
    ],
    [
      "unpause_on_resume",
      "agents.actions.unpauseOnResumeAll",
      "agents.actions.unpauseOnResumeAll.requested",
      true,
    ],
  ] as const)(
    "Given the dropdown, when clicking %s, then the correct request is fired and an info toast is shown",
    async (action, itemLabelKey, requestedMessageKey, halted) => {
      let requestFired = false;
      server.use(
        http.post(`/api/v2/agents/${action}`, () => {
          requestFired = true;

          return HttpResponse.json();
        })
      );

      const { component } = setup(halted);

      render(component);

      await openDropdown();

      await userEvent.click(screen.getByRole("menuitem", { name: words(itemLabelKey) }));

      expect(await screen.findByText(words(requestedMessageKey))).toBeVisible();
      expect(requestFired).toBeTruthy();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("Given the dropdown, when a bulk action request fails, then an error toast is shown", async () => {
    server.use(
      http.post("/api/v2/agents/pause", () => {
        return HttpResponse.json({ message: "something went wrong" }, { status: 500 });
      })
    );

    const { component } = setup();

    render(component);

    await openDropdown();

    await userEvent.click(screen.getByRole("menuitem", { name: words("agents.actions.pauseAll") }));

    expect(await screen.findByText("something went wrong")).toBeVisible();
  });

  test("Given the environment is halted, then pause/resume are disabled but the on-resume actions and venv removal aren't", async () => {
    const { component } = setup(true);

    render(component);

    await openDropdown();

    expect(screen.getByRole("menuitem", { name: words("agents.actions.pauseAll") })).toBeDisabled();
    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.resumeAll") })
    ).toBeDisabled();
    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.keepPausedOnResumeAll") })
    ).not.toBeDisabled();
    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.unpauseOnResumeAll") })
    ).not.toBeDisabled();
    expect(
      screen.getByRole("menuitem", { name: words("agents.actions.removeAllVenvs") })
    ).not.toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given isDisabled is true, then the whole dropdown toggle is disabled", async () => {
    const { component } = setup(false, true);

    render(component);

    expect(screen.getByRole("button", { name: words("agents.actions.menu.label") })).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the remove all agent venvs action, when clicked, it shows a confirmation modal explaining the asynchronous nature of the action", async () => {
    const { component } = setup();

    render(component);

    await openDropdown();

    await userEvent.click(
      screen.getByRole("menuitem", { name: words("agents.actions.removeAllVenvs") })
    );

    expect(
      await screen.findByText(words("agents.actions.removeAllVenvs.modal.title"))
    ).toBeVisible();
    expect(screen.getByText(words("agents.actions.removeAllVenvs.confirmation.p1"))).toBeVisible();
    expect(screen.getByText(words("agents.actions.removeAllVenvs.confirmation.p2"))).toBeVisible();
    expect(screen.getByText(words("agents.actions.removeAllVenvs.confirmation.p3"))).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the remove all agent venvs confirmation modal, when cancelled, it should not fire the request and close the modal", async () => {
    let requestFired = false;
    server.use(
      http.post("/api/v2/agents/remove_all_agent_venvs", () => {
        requestFired = true;

        return HttpResponse.json();
      })
    );

    const { component } = setup();

    render(component);

    await openDropdown();

    await userEvent.click(
      screen.getByRole("menuitem", { name: words("agents.actions.removeAllVenvs") })
    );

    const cancelButton = await screen.findByText(words("no"));

    await userEvent.click(cancelButton);

    expect(
      screen.queryByText(words("agents.actions.removeAllVenvs.modal.title"))
    ).not.toBeInTheDocument();
    expect(requestFired).toBeFalsy();
  });

  test("Given the remove all agent venvs confirmation modal, when confirmed, it should fire the request and show an info toast", async () => {
    let requestFired = false;
    server.use(
      http.post("/api/v2/agents/remove_all_agent_venvs", () => {
        requestFired = true;

        return HttpResponse.json();
      })
    );

    const { component } = setup();

    render(component);

    await openDropdown();

    await userEvent.click(
      screen.getByRole("menuitem", { name: words("agents.actions.removeAllVenvs") })
    );

    const confirmButton = await screen.findByText(words("yes"));

    await userEvent.click(confirmButton);

    expect(await screen.findByText(words("agents.actions.removeAllVenvs.requested"))).toBeVisible();
    expect(requestFired).toBeTruthy();
    expect(
      screen.queryByText(words("agents.actions.removeAllVenvs.modal.title"))
    ).not.toBeInTheDocument();
  });

  test("Given the remove all agent venvs confirmation modal, when confirmed and the request fails, it should show an error toast", async () => {
    server.use(
      http.post("/api/v2/agents/remove_all_agent_venvs", () => {
        return HttpResponse.json({ message: "something went wrong" }, { status: 500 });
      })
    );

    const { component } = setup();

    render(component);

    await openDropdown();

    await userEvent.click(
      screen.getByRole("menuitem", { name: words("agents.actions.removeAllVenvs") })
    );

    const confirmButton = await screen.findByText(words("yes"));

    await userEvent.click(confirmButton);

    expect(await screen.findByText("something went wrong")).toBeVisible();
  });
});
