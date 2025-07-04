import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PrimaryArchiveHelper } from "@/Data/Common/PrimaryArchiveHelper";
import { MockedDependencyProvider, MockOrchestratorProvider, ServerStatus } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { StatusPage } from ".";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <Page>
          <StatusPage />
        </Page>
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("StatusPage", () => {
  const server = setupServer(
    http.get("/api/v1/serverstatus", () => {
      return HttpResponse.json({ data: ServerStatus.withLsm });
    })
  );

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());

  afterAll(() => {
    server.close();
    vi.resetAllMocks();
  });

  test("GIVEN StatusPage THEN shows server status", async () => {
    server.use(
      http.get("/api/v1/serverstatus", () => {
        return HttpResponse.json({ data: ServerStatus.withLsm });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("list", { name: "StatusList" })).toBeVisible();
    expect(
      screen.getByRole("listitem", {
        name: "StatusItem-Inmanta Service Orchestrator",
      })
    ).toBeVisible();
    expect(
      screen.getByRole("listitem", {
        name: "StatusItem-lsm",
      })
    ).toBeVisible();
    expect(
      screen.getByRole("listitem", {
        name: "StatusItem-lsm.database",
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN StatusPage without support extension THEN download button is not present", async () => {
    vi.spyOn(MockOrchestratorProvider.prototype, "isSupportEnabled").mockReturnValue(false);
    const { component } = setup();

    render(component);

    expect(screen.queryByRole("button", { name: "DownloadArchiveButton" })).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN StatusPage with support extension THEN download button is present", async () => {
    vi.spyOn(MockOrchestratorProvider.prototype, "isSupportEnabled").mockReturnValue(true);

    const { component } = setup();

    render(component);

    expect(screen.getByRole("button", { name: "DownloadArchiveButton" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN StatusPage with support extension WHEN user click download THEN an archive is created", async () => {
    server.use(
      http.get("/api/v2/support", async () => {
        await delay(100);

        return HttpResponse.json(ServerStatus.supportArchiveBase64);
      })
    );
    const { component } = setup();

    render(component);

    const downloadButton = screen.getByRole("button", {
      name: "DownloadArchiveButton",
    });

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.download"));

    await userEvent.click(downloadButton);

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.downloading"));

    await waitFor(() =>
      expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.download"))
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN StatusPage with support extension WHEN user click download THEN button goes through correct phases", async () => {
    vi.spyOn(PrimaryArchiveHelper.prototype, "triggerDownload").mockImplementation(
      () => new Blob(["testing"], { type: "application/octet-stream" })
    );

    server.use(
      http.get("/api/v1/support", () => {
        return HttpResponse.json({ data: ServerStatus.withSupport });
      }),
      http.get("/api/v2/support", async () => {
        await delay(100);

        return HttpResponse.json(ServerStatus.supportArchiveBase64);
      })
    );
    const { component } = setup();

    render(component);

    const downloadButton = screen.getByRole("button", {
      name: "DownloadArchiveButton",
    });

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.download"));

    await userEvent.click(downloadButton);

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.downloading"));

    await waitFor(() =>
      expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.download"))
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN StatusPage with support extension WHEN user click download and response is error THEN error is shown", async () => {
    server.use(
      http.get("/api/v1/support", () => {
        return HttpResponse.json({ data: ServerStatus.withSupport });
      }),
      http.get("/api/v2/support", () => {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      })
    );
    const { component } = setup();

    render(component);

    const downloadButton = await screen.findByRole("button", {
      name: "DownloadArchiveButton",
    });

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.download"));

    await userEvent.click(downloadButton);

    const errorContainer = await screen.findByTestId("ToastAlert");

    expect(errorContainer).toBeVisible();
    expect(within(errorContainer).getByText("error")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
