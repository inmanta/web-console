import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ArchiveHelper, Deferred, Either, RemoteData } from "@/Core";
import {
  GetServerStatusContinuousQueryManager,
  GetServerStatusStateHelper,
  getStoreInstance,
  PrimaryArchiveHelper,
  PrimaryFeatureManager,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  ServerStatus,
  StaticScheduler,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { StatusPage } from ".";
expect.extend(toHaveNoViolations);

export class MockArchiveHelper implements ArchiveHelper {
  private promise;
  public resolve;
  constructor() {
    const { promise, resolve } = new Deferred();

    this.promise = promise;
    this.resolve = resolve;
  }
  async generateBlob(): Promise<Blob> {
    return this.promise as Promise<Blob>;
  }

  triggerDownload(): void {
    return;
  }
}

function setup(useMockArchiveHelper = false) {
  const client = new QueryClient();
  const store = getStoreInstance();

  store.dispatch.serverStatus.setData(RemoteData.success(ServerStatus.withoutFeatures));
  const apiHelper = new DeferredApiHelper();
  const getServerStatusQueryManager = GetServerStatusContinuousQueryManager(
    apiHelper,
    GetServerStatusStateHelper(store),
    new StaticScheduler()
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([getServerStatusQueryManager])
  );

  const featureManager = new PrimaryFeatureManager();

  const archiveHelper: MockArchiveHelper | PrimaryArchiveHelper = useMockArchiveHelper
    ? new MockArchiveHelper()
    : dependencies.archiveHelper;

  const component = (
    <QueryClientProvider client={client}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          featureManager,
          archiveHelper,
        }}
      >
        <StoreProvider store={store}>
          <Page>
            <StatusPage />
          </Page>
        </StoreProvider>
      </DependencyProvider>
    </QueryClientProvider>
  );

  return {
    component,
    apiHelper,
    archiveHelper,
  };
}
const server = setupServer();

describe("StatusPage", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN StatusPage THEN shows server status", async () => {
    const { component, apiHelper } = setup();

    render(component);

    expect(apiHelper.pendingRequests).toHaveLength(1);
    expect(apiHelper.pendingRequests[0]).toEqual({
      method: "GET",
      url: "/api/v1/serverstatus",
    });

    await act(async () => {
      await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
    });

    expect(screen.getByRole("list", { name: "StatusList" })).toBeVisible();
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
    const { component, apiHelper } = setup();

    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right({ data: ServerStatus.withoutSupport }));
    });

    expect(screen.queryByRole("button", { name: "DownloadArchiveButton" })).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN StatusPage with support extension THEN download button is present", async () => {
    const { component, apiHelper } = setup();

    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
    });

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
    const { component, apiHelper } = setup();

    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
    });

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
    server.use(
      http.get("/api/v2/support", async () => {
        await delay(100);

        return HttpResponse.json(ServerStatus.supportArchiveBase64);
      })
    );
    const { component, apiHelper, archiveHelper } = setup(true);

    render(component);
    await act(async () => {
      await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
    });

    const downloadButton = screen.getByRole("button", {
      name: "DownloadArchiveButton",
    });

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.download"));

    await userEvent.click(downloadButton);

    expect(downloadButton).toHaveTextContent(words("status.supportArchive.action.downloading"));

    (archiveHelper as MockArchiveHelper).resolve(
      new Blob(["testing"], { type: "application/octet-stream" })
    );
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
      http.get("/api/v2/support", () => {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      })
    );
    const { component, apiHelper } = setup();

    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
    });

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
