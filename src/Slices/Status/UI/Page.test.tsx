import React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { ArchiveHelper, Deferred, Either, RemoteData } from "@/Core";
import {
  CommandResolverImpl,
  GetServerStatusContinuousQueryManager,
  GetServerStatusStateHelper,
  getStoreInstance,
  GetSupportArchiveCommandManager,
  PrimaryArchiveHelper,
  PrimaryFeatureManager,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  ServerStatus,
  StaticScheduler,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

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
  const store = getStoreInstance();
  store.dispatch.serverStatus.setData(
    RemoteData.success(ServerStatus.withoutLsm),
  );
  const apiHelper = new DeferredApiHelper();
  const getServerStatusQueryManager = GetServerStatusContinuousQueryManager(
    apiHelper,
    GetServerStatusStateHelper(store),
    new StaticScheduler(),
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([getServerStatusQueryManager]),
  );
  const getSupportArchiveCommandManager = new GetSupportArchiveCommandManager(
    apiHelper,
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([getSupportArchiveCommandManager]),
  );

  const featureManager = new PrimaryFeatureManager(
    GetServerStatusStateHelper(store),
  );

  const archiveHelper: MockArchiveHelper | PrimaryArchiveHelper =
    useMockArchiveHelper ? new MockArchiveHelper() : dependencies.archiveHelper;

  const component = (
    <DependencyProvider
      dependencies={{
        ...dependencies,
        queryResolver,
        commandResolver,
        featureManager,
        archiveHelper,
      }}
    >
      <StoreProvider store={store}>
        <Page />
      </StoreProvider>
    </DependencyProvider>
  );

  return {
    component,
    apiHelper,
    archiveHelper,
  };
}

test("GIVEN StatusPage THEN shows server status", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v1/serverstatus`,
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
  });

  expect(screen.getByRole("list", { name: "StatusList" })).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-Inmanta Service Orchestrator",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-lsm",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-lsm.database",
    }),
  ).toBeVisible();
});

test("GIVEN StatusPage without support extension THEN download button is not present", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: ServerStatus.withoutSupport }),
    );
  });

  expect(
    screen.queryByRole("button", { name: "DownloadArchiveButton" }),
  ).not.toBeInTheDocument();
});

test("GIVEN StatusPage with support extension THEN download button is present", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
  });

  expect(
    screen.getByRole("button", { name: "DownloadArchiveButton" }),
  ).toBeVisible();
});

test("GIVEN StatusPage with support extension WHEN user click download THEN an archive is created", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
  });

  const downloadButton = screen.getByRole("button", {
    name: "DownloadArchiveButton",
  });
  expect(downloadButton).toHaveTextContent(
    words("status.supportArchive.action.download"),
  );

  await act(async () => {
    await userEvent.click(downloadButton);
  });

  expect(downloadButton).toHaveTextContent(
    words("status.supportArchive.action.downloading"),
  );

  expect(apiHelper.pendingRequests).toEqual([
    { method: "GET", url: "/api/v2/support" },
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: ServerStatus.supportArchiveBase64 }),
    );
  });
  await waitFor(() =>
    expect(downloadButton).toHaveTextContent(
      words("status.supportArchive.action.download"),
    ),
  );
});

test("GIVEN StatusPage with support extension WHEN user click download THEN button goes through correct phases", async () => {
  const { component, apiHelper, archiveHelper } = setup(true);
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
  });

  const downloadButton = screen.getByRole("button", {
    name: "DownloadArchiveButton",
  });
  expect(downloadButton).toHaveTextContent(
    words("status.supportArchive.action.download"),
  );

  await act(async () => {
    await userEvent.click(downloadButton);
  });

  expect(downloadButton).toHaveTextContent(
    words("status.supportArchive.action.downloading"),
  );

  expect(apiHelper.pendingRequests).toEqual([
    { method: "GET", url: "/api/v2/support" },
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: ServerStatus.supportArchiveBase64 }),
    );
  });
  expect(downloadButton).toHaveTextContent(
    words("status.supportArchive.action.generating"),
  );
  (archiveHelper as MockArchiveHelper).resolve(
    new Blob(["testing"], { type: "application/octet-stream" }),
  );
  await waitFor(() =>
    expect(downloadButton).toHaveTextContent(
      words("status.supportArchive.action.download"),
    ),
  );
});

test("GIVEN StatusPage with support extension WHEN user click download and response is error THEN error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withSupport }));
  });

  const downloadButton = screen.getByRole("button", {
    name: "DownloadArchiveButton",
  });

  await act(async () => {
    await userEvent.click(downloadButton);
  });
  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(downloadButton).toHaveTextContent(
    words("status.supportArchive.action.download"),
  );
  const errorContainer = screen.getByTestId("ToastAlert");
  expect(errorContainer).toBeVisible();
  expect(within(errorContainer).getByText("error")).toBeVisible();
});
