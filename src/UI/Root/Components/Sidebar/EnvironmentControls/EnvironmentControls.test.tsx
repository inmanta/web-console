import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  getStoreInstance,
  HaltEnvironmentCommandManager,
  QueryResolverImpl,
  ResumeEnvironmentCommandManager,
} from "@/Data";
import {
  EnvironmentDetailsContinuousQueryManager,
  EnvironmentDetailsUpdater,
  GetEnvironmentDetailsStateHelper,
} from "@/Slices/Settings/Data/GetEnvironmentDetails";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  EnvironmentDetails,
  MockEnvironmentHandler,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentControls } from "./EnvironmentControls";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const environmentDetailsStateHelper = GetEnvironmentDetailsStateHelper(store);
  const environmentDetailsQueryManager =
    EnvironmentDetailsContinuousQueryManager(store, apiHelper, scheduler);

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([environmentDetailsQueryManager])
  );

  const haltEnvironmentManager = HaltEnvironmentCommandManager(
    new BaseApiHelper(),
    environmentDetailsStateHelper,
    new EnvironmentDetailsUpdater(store, apiHelper)
  );

  const resumeEnvironmentManager = ResumeEnvironmentCommandManager(
    new BaseApiHelper(),
    environmentDetailsStateHelper,
    new EnvironmentDetailsUpdater(store, apiHelper)
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      haltEnvironmentManager,
      resumeEnvironmentManager,
    ])
  );

  const component = (
    <MemoryRouter initialEntries={[{ search: "?env=123" }]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler: MockEnvironmentHandler(EnvironmentDetails.a.id),
        }}
      >
        <StoreProvider store={store}>
          <EnvironmentControls />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
  return {
    component,
    apiHelper,
    scheduler,
  };
}

test("EnvironmentControls halt the environment when clicked and the environment is running", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentDetails.a }));
  });
  const stopButton = await screen.findByText("STOP");
  expect(stopButton).toBeVisible();
  await userEvent.click(stopButton);
  await userEvent.click(await screen.findByText("Yes"));
  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(`/api/v2/actions/environment/halt`);
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(
    EnvironmentDetails.a.id
  );
});

test("EnvironmentControls don\\t trigger backend call when dialog is not confirmed", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentDetails.a }));
  });
  const stopButton = await screen.findByText("STOP");
  expect(stopButton).toBeVisible();
  await userEvent.click(stopButton);
  await userEvent.click(await screen.findByText("No"));
  expect(fetchMock.mock.calls).toHaveLength(0);
});

test("EnvironmentControls resume the environment when clicked and the environment is halted", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: { ...EnvironmentDetails.a, halted: true } })
    );
  });
  expect(await screen.findByText("Operations halted")).toBeVisible();
  const start = await screen.findByText("Resume");
  expect(start).toBeVisible();
  await userEvent.click(start);
  await userEvent.click(await screen.findByText("Yes"));
  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(`/api/v2/actions/environment/resume`);
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(
    EnvironmentDetails.a.id
  );
});
